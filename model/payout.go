package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  const (
        PayoutStatusPending     = "pending"
        PayoutStatusAdminPaid   = "admin_paid"
        PayoutStatusDistributed = "distributed"
  )

  // Payout 结算单（主管理给组长打款一次生成一条）
  type Payout struct {
        Id                 int     `json:"id" gorm:"primaryKey;autoIncrement"`
        GroupId            int     `json:"group_id" gorm:"index;not null"`
        ToUserId           int     `json:"to_user_id" gorm:"index;not null"`         // 通常是组长
        PeriodStart        int64   `json:"period_start" gorm:"bigint"`               // 结算周期起
        PeriodEnd          int64   `json:"period_end" gorm:"bigint"`                 // 结算周期止
        TotalAmount        float64 `json:"total_amount" gorm:"type:decimal(12,2)"`
        Status             string  `json:"status" gorm:"type:varchar(24);default:'pending';index"`
        AdminPayEvidence   string  `json:"admin_pay_evidence" gorm:"type:varchar(255)"` // 打款凭证URL
        AdminPaidAt        int64   `json:"admin_paid_at" gorm:"bigint"`
        DistributedAt      int64   `json:"distributed_at" gorm:"bigint"`                // 组长完成分发的时间
        Notes              string  `json:"notes" gorm:"type:text"`
        CreatedTime        int64   `json:"created_time" gorm:"bigint;index"`
        UpdatedTime        int64   `json:"updated_time" gorm:"bigint"`
  }

  func (p *Payout) TableName() string {
        return "payouts"
  }

  // Insert 创建结算单
  func (p *Payout) Insert() error {
        now := common.GetTimestamp()
        p.CreatedTime = now
        p.UpdatedTime = now
        if p.Status == "" {
                p.Status = PayoutStatusPending
        }
        return DB.Create(p).Error
  }

  // Update 更新结算单
  func (p *Payout) Update() error {
        p.UpdatedTime = common.GetTimestamp()
        return DB.Save(p).Error
  }

  // GetPayoutById 根据 ID 查询
  func GetPayoutById(id int) (*Payout, error) {
        var p Payout
        err := DB.Where("id = ?", id).First(&p).Error
        if err != nil {
                return nil, err
        }
        return &p, nil
  }

  // GetPayoutsByGroup 查询小组的所有结算单
  func GetPayoutsByGroup(groupId int, limit, offset int) ([]*Payout, int64, error) {
        var payouts []*Payout
        var total int64
        q := DB.Model(&Payout{}).Where("group_id = ?", groupId)
        q.Count(&total)
        err := q.Order("created_time DESC").Limit(limit).Offset(offset).Find(&payouts).Error
        return payouts, total, err
  }