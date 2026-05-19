package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  const (
        LeaderboardPeriodDaily  = "daily"
        LeaderboardPeriodWeekly = "weekly"
  )

  type LeaderboardSnapshot struct {
        Id            int     `json:"id" gorm:"primaryKey;autoIncrement"`
        PeriodType    string  `json:"period_type" gorm:"type:varchar(16);index;not null"`
        PeriodDate    string  `json:"period_date" gorm:"type:varchar(16);index;not null"`
        GroupId       int     `json:"group_id" gorm:"index;not null"`
        RankNo        int     `json:"rank_no" gorm:"index"`
        SalesAmount   float64 `json:"sales_amount" gorm:"type:decimal(14,2)"`
        TokenConsumed int64   `json:"token_consumed" gorm:"bigint"`
        TopModels     string  `json:"top_models" gorm:"type:text"`
        CreatedTime   int64   `json:"created_time" gorm:"bigint"`
  }

  func (s *LeaderboardSnapshot) TableName() string {
        return "leaderboard_snapshots"
  }

  func (s *LeaderboardSnapshot) Insert() error {
        s.CreatedTime = common.GetTimestamp()
        return DB.Create(s).Error
  }

  func GetLeaderboardByPeriod(periodType, periodDate string, limit int) ([]*LeaderboardSnapshot, error) {
        var rows []*LeaderboardSnapshot
        err := DB.Where("period_type = ? AND period_date = ?", periodType, periodDate).
                Order("rank_no ASC").
                Limit(limit).
                Find(&rows).Error
        return rows, err
  }

  func DeleteLeaderboardByPeriod(periodType, periodDate string) error {
        return DB.Where("period_type = ? AND period_date = ?", periodType, periodDate).
                Delete(&LeaderboardSnapshot{}).Error
  }