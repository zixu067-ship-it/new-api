package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  const (
        LeaderboardPeriodDaily  = "daily"
        LeaderboardPeriodWeekly = "weekly"
  )

  // LeaderboardSnapshot 排行榜快照（每日凌晨定时任务生成）
  type LeaderboardSnapshot struct {
        Id            int     `json:"id" gorm:"primaryKey;autoIncrement"`
        PeriodType    string  `json:"period_type" gorm:"type:varchar(16);index;not null"`  // daily/weekly
        PeriodDate    string  `json:"period_date" gorm:"type:varchar(16);index;not null"`  // YYYY-MM-DD or YYYY-Www
        GroupId       int     `json:"group_id" gorm:"index;not null"`
        RankNo        int     `json:"rank_no" gorm:"index"`                                // 名次
        SalesAmount   float64 `json:"sales_amount" gorm:"type:decimal(14,2)"`              // 销售额(用户充值总额)
        TokenConsumed int64   `json:"token_consumed" gorm:"bigint"`                        // token 消耗量
        TopModels     string  `json:"top_models" gorm:"type:text"`                         // JSON:
  [{"model":"gpt-4o","pct":45}, ...]
        CreatedTime   int64   `json:"created_time" gorm:"bigint"`
  }

  func (s *LeaderboardSnapshot) TableName() string {
        return "leaderboard_snapshots"
  }

  // Insert 写入快照
  func (s *LeaderboardSnapshot) Insert() error {
        s.CreatedTime = common.GetTimestamp()
        return DB.Create(s).Error
  }

  // GetLeaderboardByPeriod 查询指定周期的排行榜
  func GetLeaderboardByPeriod(periodType, periodDate string, limit int) ([]*LeaderboardSnapshot, error) {
        var rows []*LeaderboardSnapshot
        err := DB.Where("period_type = ? AND period_date = ?", periodType, periodDate).
                Order("rank_no ASC").
                Limit(limit).
                Find(&rows).Error
        return rows, err
  }

  // DeleteLeaderboardByPeriod 删除指定周期的旧快照（重新生成前调用）
  func DeleteLeaderboardByPeriod(periodType, periodDate string) error {
        return DB.Where("period_type = ? AND period_date = ?", periodType, periodDate).
                Delete(&LeaderboardSnapshot{}).Error
  }