package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  type UserGroupAttribution struct {
        UserId        int    `json:"user_id" gorm:"primaryKey"`
        GroupId       int    `json:"group_id" gorm:"index;not null"`
        FirstVisitAt  int64  `json:"first_visit_at" gorm:"bigint"`
        RegisteredVia string `json:"registered_via" gorm:"type:varchar(64)"`
        CreatedTime   int64  `json:"created_time" gorm:"bigint"`
  }

  func (a *UserGroupAttribution) TableName() string {
        return "user_group_attributions"
  }

  func GetAttributionByUserId(userId int) (*UserGroupAttribution, error) {
        var a UserGroupAttribution
        err := DB.Where("user_id = ?", userId).First(&a).Error
        if err != nil {
                return nil, err
        }
        return &a, nil
  }

  func (a *UserGroupAttribution) Insert() error {
        now := common.GetTimestamp()
        if a.FirstVisitAt == 0 {
                a.FirstVisitAt = now
        }
        a.CreatedTime = now
        return DB.Create(a).Error
  }