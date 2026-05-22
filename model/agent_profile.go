package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  type AgentProfile struct {
        UserId      int    `json:"user_id" gorm:"primaryKey"`
        RealName    string `json:"real_name" gorm:"type:varchar(64)"`
        Phone       string `json:"phone" gorm:"type:varchar(32)"`
        WechatId    string `json:"wechat_id" gorm:"type:varchar(64)"`
        AvatarUrl   string `json:"avatar_url" gorm:"type:varchar(512)"`
        WechatQrUrl string `json:"wechat_qr_url" gorm:"type:varchar(255)"`
        AlipayQrUrl string `json:"alipay_qr_url" gorm:"type:varchar(255)"`
        Remark      string `json:"remark" gorm:"type:text"`
        CreatedTime int64  `json:"created_time" gorm:"bigint"`
        UpdatedTime int64  `json:"updated_time" gorm:"bigint"`
  }

  func (p *AgentProfile) TableName() string {
        return "agent_profiles"
  }

  func GetAgentProfileByUserId(userId int) (*AgentProfile, error) {
        var p AgentProfile
        err := DB.Where("user_id = ?", userId).First(&p).Error
        if err != nil {
                return nil, err
        }
        return &p, nil
  }

  func (p *AgentProfile) Upsert() error {
        now := common.GetTimestamp()
        p.UpdatedTime = now
        var existing AgentProfile
        err := DB.Where("user_id = ?", p.UserId).First(&existing).Error
        if err != nil {
                p.CreatedTime = now
                return DB.Create(p).Error
        }
        p.CreatedTime = existing.CreatedTime
        return DB.Save(p).Error
  }