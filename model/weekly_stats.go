package model

import "time"

// CurrentWeekRangeUnix returns Monday 00:00 - now (server local time) as unix seconds.
func CurrentWeekRangeUnix() (int64, int64) {
    now := time.Now()
    weekday := int(now.Weekday())
    if weekday == 0 { // Sunday -> 7
        weekday = 7
    }
    // Days since Monday
    daysSinceMonday := weekday - 1
    monday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -daysSinceMonday)
    return monday.Unix(), now.Unix()
}

// GroupWeeklyStats holds weekly topup + share for a single group.
type GroupWeeklyStats struct {
    GroupId         int     `json:"group_id"`
    WeeklyTopupSum  float64 `json:"weekly_topup_sum"`
    WeeklyGroupShare float64 `json:"weekly_group_share"`
}

// GetWeeklyStatsForGroup returns this week's topup sum and group share for a single group.
func GetWeeklyStatsForGroup(groupId int) GroupWeeklyStats {
    start, end := CurrentWeekRangeUnix()
    var stats GroupWeeklyStats
    stats.GroupId = groupId
    type row struct {
        TotalTopup float64
        TotalShare float64
    }
    var r row
    DB.Model(&ProfitRecord{}).
        Where("group_id = ? AND created_time >= ? AND created_time <= ?", groupId, start, end).
        Select("COALESCE(SUM(topup_amount),0) as total_topup, COALESCE(SUM(group_share_amount),0) as total_share").
        Scan(&r)
    stats.WeeklyTopupSum = r.TotalTopup
    stats.WeeklyGroupShare = r.TotalShare
    return stats
}

// GetWeeklyStatsAllGroups returns stats keyed by group_id.
func GetWeeklyStatsAllGroups() map[int]GroupWeeklyStats {
    start, end := CurrentWeekRangeUnix()
    type row struct {
        GroupId    int
        TotalTopup float64
        TotalShare float64
    }
    var rows []row
    DB.Model(&ProfitRecord{}).
        Where("created_time >= ? AND created_time <= ?", start, end).
        Select("group_id, COALESCE(SUM(topup_amount),0) as total_topup, COALESCE(SUM(group_share_amount),0) as total_share").
        Group("group_id").
        Scan(&rows)
    out := map[int]GroupWeeklyStats{}
    for _, r := range rows {
        out[r.GroupId] = GroupWeeklyStats{GroupId: r.GroupId, WeeklyTopupSum: r.TotalTopup, WeeklyGroupShare: r.TotalShare}
    }
    return out
}
