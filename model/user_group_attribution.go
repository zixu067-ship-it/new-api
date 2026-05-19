package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  // UserGroupAttribution 用户归属（用户从哪个镜像站注册的，分润看这张表）
  type UserGroupAttribution struct {
        UserId         int    `json:"user_id" gorm:"primaryKey"`
        GroupId        int    `json:"group_id" gorm:"index;not null"`
        FirstVisitAt   int64  `json:"first_visit_at" gorm:"bigint"`   // 首次访问镜像站时间
        RegisteredVia  string `json:"registered_via" gorm:"type:varchar(64)"` // ip/ua 等留痕
        CreatedTime    int64  `json:"created_time" gorm:"bigint"`
  }

  func (a *UserGroupAttribution) TableName() string {
        return "user_group_attributions"
  }

  // GetAttributionByUserId 查询用户归属的小组
  func GetAttributionByUserId(userId int) (*UserGroupAttribution, error) {
        var a UserGroupAttribution
        err := DB.Where("user_id = ?", userId).First(&a).Error
        if err != nil {
                return nil, err
        }
        return &a, nil
  }

  // Insert 创建归属（用户注册时一次性写入，之后不再变）
  func (a *UserGroupAttribution) Insert() error {
        now := common.GetTimestamp()
        if a.FirstVisitAt == 0 {
                a.FirstVisitAt = now
        }
        a.CreatedTime = now
        return DB.Create(a).Error
  }