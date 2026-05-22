package controller

import (
    "net/http"
    "sort"
    "strconv"
    "time"

    "github.com/QuantumNous/new-api/model"
    "github.com/gin-gonic/gin"
)

// GET /api/agent/leaderboard  — current week ranking by weekly topup sum
func GetPromoLeaderboard(c *gin.Context) {
    statsMap := model.GetWeeklyStatsAllGroups()
    groups, err := model.GetAllPromoGroups()
    if err != nil {
        c.JSON(http.StatusOK, gin.H{"success": false, "message": "查询失败"})
        return
    }
    type entry struct {
        GroupId         int     `json:"group_id"`
        GroupName       string  `json:"group_name"`
        Slogan          string  `json:"slogan"`
        AvatarUrl       string  `json:"avatar_url"`
        WeeklyTopupSum  float64 `json:"weekly_topup_sum"`
        WeeklyGroupShare float64 `json:"weekly_group_share"`
        CurrentSharePct float64 `json:"current_share_pct"`
        Leader          gin.H   `json:"leader"`
        Members         []gin.H `json:"members"`
        // legacy fields for old UI components still in tree
        WeeklyRevenue   float64 `json:"weekly_revenue"`
    }
    items := make([]entry, 0, len(groups))
    for _, g := range groups {
        if g.Status != 1 {
            continue
        }
        s := statsMap[g.Id]
        leaderUser, _ := model.GetUserById(g.LeaderUserId, false)
        leaderProfile, _ := model.GetAgentProfileByUserId(g.LeaderUserId)
        leaderItem := gin.H{}
        if leaderUser != nil {
            leaderItem["username"] = leaderUser.Username
            leaderItem["display_name"] = leaderUser.DisplayName
        }
        if leaderProfile != nil {
            leaderItem["real_name"] = leaderProfile.RealName
            leaderItem["avatar_url"] = leaderProfile.AvatarUrl
        }
        members, _ := model.GetPromoMembersByGroup(g.Id)
        memberList := make([]gin.H, 0)
        for _, m := range members {
            if m.Role == "leader" || m.UserId == 0 || m.Status != 1 {
                continue
            }
            mu, _ := model.GetUserById(m.UserId, false)
            mp, _ := model.GetAgentProfileByUserId(m.UserId)
            mi := gin.H{}
            if mu != nil {
                mi["username"] = mu.Username
                mi["display_name"] = mu.DisplayName
            }
            if mp != nil {
                mi["real_name"] = mp.RealName
                mi["avatar_url"] = mp.AvatarUrl
            }
            memberList = append(memberList, mi)
        }
        items = append(items, entry{
            GroupId:          g.Id,
            GroupName:        g.GroupName,
            Slogan:           g.Slogan,
            AvatarUrl:        g.AvatarUrl,
            WeeklyTopupSum:   s.WeeklyTopupSum,
            WeeklyGroupShare: s.WeeklyGroupShare,
            WeeklyRevenue:    s.WeeklyTopupSum,
            CurrentSharePct:  g.CurrentSharePct,
            Leader:           leaderItem,
            Members:          memberList,
        })
    }
    sort.Slice(items, func(i, j int) bool {
        return items[i].WeeklyTopupSum > items[j].WeeklyTopupSum
    })
    c.JSON(http.StatusOK, gin.H{"success": true, "data": items, "week_start": weekStartUnixSafe()})
}

func weekStartUnixSafe() int64 {
    s, _ := model.CurrentWeekRangeUnix()
    return s
}

// GET /api/agent/leaderboard/history  — list of past snapshots, by period_date desc
func GetPromoLeaderboardHistory(c *gin.Context) {
    pageStr := c.DefaultQuery("page", "1")
    page, _ := strconv.Atoi(pageStr)
    if page < 1 {
        page = 1
    }
    pageSize := 20
    var dates []string
    model.DB.Raw("SELECT DISTINCT period_date FROM leaderboard_snapshots WHERE period_type = ? ORDER BY period_date DESC LIMIT ? OFFSET ?", "weekly", pageSize, (page-1)*pageSize).Scan(&dates)
    out := make([]gin.H, 0, len(dates))
    for _, d := range dates {
        rows, err := model.GetLeaderboardByPeriod("weekly", d, 100)
        if err != nil {
            continue
        }
        items := make([]gin.H, 0, len(rows))
        for _, r := range rows {
            g, gErr := model.GetPromoGroupById(r.GroupId)
            item := gin.H{
                "rank_no":       r.RankNo,
                "sales_amount":  r.SalesAmount,
                "group_id":      r.GroupId,
            }
            if gErr == nil && g != nil {
                item["group_name"] = g.GroupName
                item["slogan"] = g.Slogan
                item["avatar_url"] = g.AvatarUrl
                leaderProfile, _ := model.GetAgentProfileByUserId(g.LeaderUserId)
                leaderUser, _ := model.GetUserById(g.LeaderUserId, false)
                leaderItem := gin.H{}
                if leaderUser != nil {
                    leaderItem["username"] = leaderUser.Username
                    leaderItem["display_name"] = leaderUser.DisplayName
                }
                if leaderProfile != nil {
                    leaderItem["real_name"] = leaderProfile.RealName
                    leaderItem["avatar_url"] = leaderProfile.AvatarUrl
                }
                item["leader"] = leaderItem
                members, _ := model.GetPromoMembersByGroup(g.Id)
                ml := make([]gin.H, 0)
                for _, m := range members {
                    if m.Role == "leader" || m.UserId == 0 || m.Status != 1 {
                        continue
                    }
                    mu, _ := model.GetUserById(m.UserId, false)
                    mp, _ := model.GetAgentProfileByUserId(m.UserId)
                    mi := gin.H{}
                    if mu != nil {
                        mi["username"] = mu.Username
                        mi["display_name"] = mu.DisplayName
                    }
                    if mp != nil {
                        mi["real_name"] = mp.RealName
                        mi["avatar_url"] = mp.AvatarUrl
                    }
                    ml = append(ml, mi)
                }
                item["members"] = ml
            }
            items = append(items, item)
        }
        out = append(out, gin.H{"period_date": d, "items": items})
    }
    c.JSON(http.StatusOK, gin.H{"success": true, "data": out, "page": page})
}

// SnapshotPromoLeaderboard captures current weekly ranking into leaderboard_snapshots.
// Called by cron every Sunday 23:59.
func SnapshotPromoLeaderboard() {
    statsMap := model.GetWeeklyStatsAllGroups()
    groups, err := model.GetAllPromoGroups()
    if err != nil {
        return
    }
    type pair struct {
        gid   int
        topup float64
        share float64
    }
    arr := make([]pair, 0, len(groups))
    for _, g := range groups {
        if g.Status != 1 {
            continue
        }
        s := statsMap[g.Id]
        arr = append(arr, pair{gid: g.Id, topup: s.WeeklyTopupSum, share: s.WeeklyGroupShare})
    }
    sort.Slice(arr, func(i, j int) bool { return arr[i].topup > arr[j].topup })
    periodDate := time.Now().Format("2006-01-02")
    _ = model.DeleteLeaderboardByPeriod("weekly", periodDate)
    for i, p := range arr {
        snap := &model.LeaderboardSnapshot{
            PeriodType:  "weekly",
            PeriodDate:  periodDate,
            GroupId:     p.gid,
            RankNo:      i + 1,
            SalesAmount: p.topup,
        }
        _ = snap.Insert()
    }
}

// StartPromoLeaderboardCron runs forever, snapshotting the weekly leaderboard
// each Sunday at 23:59 local time.
func StartPromoLeaderboardCron() {
    for {
        now := time.Now()
        // Compute next Sunday 23:59:00 local
        daysUntilSun := (int(time.Sunday) - int(now.Weekday()) + 7) % 7
        next := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 0, 0, now.Location()).AddDate(0, 0, daysUntilSun)
        if !next.After(now) {
            next = next.AddDate(0, 0, 7)
        }
        time.Sleep(time.Until(next))
        SnapshotPromoLeaderboard()
    }
}
