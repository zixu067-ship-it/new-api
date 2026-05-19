package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  const (
        SettlementStatusPending   = "pending"
        SettlementStatusPaid      = "paid"
        SettlementStatusRejected  = "rejected"
  )

  // ProfitRecord 利润分账记录（用户每次充值产生一条）
  type ProfitRecord struct {
        Id                int     `json:"id" gorm:"primaryKey;autoIncrement"`
        TopupId           int     `json:"topup_id" gorm:"index"`                       // 关联 topups 表
        UserId            int     `json:"user_id" gorm:"index;not null"`
        GroupId           int     `json:"group_id" gorm:"index"`                       // 0 表示无归属
        TopupAmount       float64 `json:"topup_amount" gorm:"type:decimal(12,2)"`       // 用户实付金额
        DiscountApplied   float64 `json:"discount_applied" gorm:"type:decimal(3,2)"`    // 实际折扣
        ProfitBase        float64 `json:"profit_base" gorm:"type:decimal(12,2)"`        // 利润基数(扣折扣后)
        GroupSharePct     float64 `json:"group_share_pct" gorm:"type:decimal(5,2)"`     // 该笔小组分成比例(25或35)
        GroupShareAmount  float64 `json:"group_share_amount" gorm:"type:decimal(12,2)"` // 小组应得金额
        MemberBreakdown   string  `json:"member_breakdown" gorm:"type:text"`            // JSON: {"user_id": amount, ...
        SettlementStatus  string  `json:"settlement_status" gorm:"type:varchar(16);default:'pending';index"`
        PayoutId          int     `json:"payout_id" gorm:"index"`                       // 关联 payouts 表
        CreatedTime       int64   `json:"created_time" gorm:"bigint;index"`
  }

  func (p *ProfitRecord) TableName() string {
        return "profit_records"
  }

  // Insert 写入新分账记录
  func (p *ProfitRecord) Insert() error {
        p.CreatedTime = common.GetTimestamp()
        if p.SettlementStatus == "" {
                p.SettlementStatus = SettlementStatusPending
        }
        return DB.Create(p).Error
  }

  // GetProfitRecordsByGroup 查询某小组的分账记录
  func GetProfitRecordsByGroup(groupId int, status string, limit, offset int) ([]*ProfitRecord, int64, error) {
        var records []*ProfitRecord
        var total int64
        q := DB.Model(&ProfitRecord{}).Where("group_id = ?", groupId)
        if status != "" {
                q = q.Where("settlement_status = ?", status)
        }
        q.Count(&total)
        err := q.Order("created_time DESC").Limit(limit).Offset(offset).Find(&records).Error
        return records, total, err
  }

  // SumPendingByGroup 统计某小组待结算金额
  func SumPendingByGroup(groupId int) (float64, error) {
        var total float64
        err := DB.Model(&ProfitRecord{}).
                Where("group_id = ? AND settlement_status = ?", groupId, SettlementStatusPending).
                Select("COALESCE(SUM(group_share_amount), 0)").
                Scan(&total).Error
        return total, err
  }