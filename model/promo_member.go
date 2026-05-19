package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  // PromoMember 推广小组成员（含组长本人）
  type PromoMember struct {
        Id                  int     `json:"id" gorm:"primaryKey;autoIncrement"`
        GroupId             int     `json:"group_id" gorm:"index;not null"`
        UserId              int     `json:"user_id" gorm:"uniqueIndex;not null"`              // 一个用户只能在一个组
        Role                string  `json:"role" gorm:"type:varchar(16);not null"`            // leader 或 member
        SharePctInGroup     float64 `json:"share_pct_in_group" gorm:"type:decimal(5,2)"`      //
  在组的25%里占多少%(展示给组员的数)
        SharePctOfPlatform  float64 `json:"share_pct_of_platform" gorm:"type:decimal(6,3)"`   //
  实际占全平台利润的%(组员看不到)
        InviteToken         string  `json:"invite_token" gorm:"type:varchar(64);index"`       // 组长发出的邀请链接token
        Status              int     `json:"status" gorm:"type:tinyint;default:1"`
        JoinedAt            int64   `json:"joined_at" gorm:"bigint"`
  }

  func (m *PromoMember) TableName() string {
        return "promo_members"
  }

  // GetPromoMemberByUserId 查询用户是否已在某个小组
  func GetPromoMemberByUserId(userId int) (*PromoMember, error) {
        var m PromoMember
        err := DB.Where("user_id = ?", userId).First(&m).Error
        if err != nil {
                return nil, err
        }
        return &m, nil
  }

  // GetPromoMembersByGroup 查询小组所有成员
  func GetPromoMembersByGroup(groupId int) ([]*PromoMember, error) {
        var members []*PromoMember
        err := DB.Where("group_id = ?", groupId).Find(&members).Error
        return members, err
  }

  // GetPromoMemberByInviteToken 通过邀请token查询(用于接受邀请时)
  func GetPromoMemberByInviteToken(token string) (*PromoMember, error) {
        var m PromoMember
        err := DB.Where("invite_token = ?", token).First(&m).Error
        if err != nil {
                return nil, err
        }
        return &m, nil
  }

  // Insert 创建成员
  func (m *PromoMember) Insert() error {
        m.JoinedAt = common.GetTimestamp()
        return DB.Create(m).Error
  }

  // Update 更新成员
  func (m *PromoMember) Update() error {
        return DB.Save(m).Error
  }