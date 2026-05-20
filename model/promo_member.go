package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  type PromoMember struct {
        Id                 int     `json:"id" gorm:"primaryKey;autoIncrement"`
        GroupId            int     `json:"group_id" gorm:"index;not null"`
        UserId             int     `json:"user_id" gorm:"index;not null"`
        Role               string  `json:"role" gorm:"type:varchar(16);not null"`
        SharePctInGroup    float64 `json:"share_pct_in_group" gorm:"type:decimal(5,2)"`
        SharePctOfPlatform float64 `json:"share_pct_of_platform" gorm:"type:decimal(6,3)"`
        InviteToken        string  `json:"invite_token" gorm:"type:varchar(64);index"`
        Status             int     `json:"status" gorm:"type:tinyint;default:1"`
        JoinedAt           int64   `json:"joined_at" gorm:"bigint"`
  }

  func (m *PromoMember) TableName() string {
        return "promo_members"
  }

  func GetPromoMemberByUserId(userId int) (*PromoMember, error) {
        var m PromoMember
        err := DB.Where("user_id = ?", userId).First(&m).Error
        if err != nil {
                return nil, err
        }
        return &m, nil
  }

  func GetPromoMembersByGroup(groupId int) ([]*PromoMember, error) {
        var members []*PromoMember
        err := DB.Where("group_id = ?", groupId).Find(&members).Error
        return members, err
  }


  func GetPromoMemberByInviteToken(token string) (*PromoMember, error) {
        var m PromoMember
        err := DB.Where("invite_token = ?", token).First(&m).Error
        if err != nil {
                return nil, err
        }
        return &m, nil
  }

  func (m *PromoMember) Insert() error {
        m.JoinedAt = common.GetTimestamp()
        return DB.Create(m).Error
  }

  func (m *PromoMember) Update() error {
        return DB.Save(m).Error
  }