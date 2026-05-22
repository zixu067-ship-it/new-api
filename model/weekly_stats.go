package model

import "time"

func CurrentWeekRangeUnix() (int64, int64) {
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	daysSinceMonday := weekday - 1
	monday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -daysSinceMonday)
	return monday.Unix(), now.Unix()
}

type GroupWeeklyStats struct {
	GroupId          int     `json:"group_id"`
	WeeklyTopupSum   float64 `json:"weekly_topup_sum"`
	WeeklyGroupShare float64 `json:"weekly_group_share"`
}

// GetWeeklyStatsForGroup computes weekly topup sum + share dynamically using the
// group's CURRENT share pct, so admin changes to share pct take effect immediately.
func GetWeeklyStatsForGroup(groupId int) GroupWeeklyStats {
	start, end := CurrentWeekRangeUnix()
	stats := GroupWeeklyStats{GroupId: groupId}
	var totalTopup float64
	DB.Model(&ProfitRecord{}).
		Where("group_id = ? AND created_time >= ? AND created_time <= ?", groupId, start, end).
		Select("COALESCE(SUM(topup_amount),0)").
		Scan(&totalTopup)
	stats.WeeklyTopupSum = totalTopup
	g, err := GetPromoGroupById(groupId)
	if err == nil && g != nil {
		stats.WeeklyGroupShare = totalTopup * 0.5 * g.CurrentSharePct / 100.0
	}
	return stats
}

func GetWeeklyStatsAllGroups() map[int]GroupWeeklyStats {
	start, end := CurrentWeekRangeUnix()
	type row struct {
		GroupId    int
		TotalTopup float64
	}
	var rows []row
	DB.Model(&ProfitRecord{}).
		Where("created_time >= ? AND created_time <= ?", start, end).
		Select("group_id, COALESCE(SUM(topup_amount),0) as total_topup").
		Group("group_id").
		Scan(&rows)
	out := map[int]GroupWeeklyStats{}
	for _, r := range rows {
		s := GroupWeeklyStats{GroupId: r.GroupId, WeeklyTopupSum: r.TotalTopup}
		if g, err := GetPromoGroupById(r.GroupId); err == nil && g != nil {
			s.WeeklyGroupShare = r.TotalTopup * 0.5 * g.CurrentSharePct / 100.0
		}
		out[r.GroupId] = s
	}
	return out
}
