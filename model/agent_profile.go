package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  // AgentProfile 代理人联系方式（注册成代理时填写）
  type AgentProfile struct {
        UserId       int    `json:"user_id" gorm:"primaryKey"`
        RealName     string `json:"real_name" gorm:"type:varchar(64)"`
        Phone        string `json:"phone" gorm:"type:varchar(32)"`
        WechatId     string `json:"wechat_id" gorm:"type:varchar(64)"`
        WechatQrUrl  string `json:"wechat_qr_url" gorm:"type:varchar(255)"`  // 微信收款码图片
        AlipayQrUrl  string `json:"alipay_qr_url" gorm:"type:varchar(255)"`  // 支付宝收款码(可选)
        Remark       string `json:"remark" gorm:"type:text"`
        CreatedTime  int64  `json:"created_time" gorm:"bigint"`
        UpdatedTime  int64  `json:"updated_time" gorm:"bigint"`
  }

  func (p *AgentProfile) TableName() string {
        return "agent_profiles"
  }

  // GetAgentProfileByUserId 查询代理人资料
  func GetAgentProfileByUserId(userId int) (*AgentProfile, error) {
        var p AgentProfile
        err := DB.Where("user_id = ?", userId).First(&p).Error
        if err != nil {
                return nil, err
        }
        return &p, nil
  }

  // Upsert 创建或更新代理人资料
  func (p *AgentProfile) Upsert() error {
        now := common.GetTimestamp()
        p.UpdatedTime = now
        var existing AgentProfile
        err := DB.Where("user_id = ?", p.UserId).First(&existing).Error
        if err != nil {
                // 不存在则创建
                p.CreatedTime = now
                return DB.Create(p).Error
        }
        // 已存在则更新
        p.CreatedTime = existing.CreatedTime
        return DB.Save(p).Error
  }