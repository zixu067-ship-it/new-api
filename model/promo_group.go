package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  type PromoGroup struct {
        Id                int     `json:"id" gorm:"primaryKey;autoIncrement"`
        LeaderUserId      int     `json:"leader_user_id" gorm:"index;not null"`
        GroupCode         string  `json:"group_code" gorm:"type:varchar(32);uniqueIndex;not null"`
        GroupName         string  `json:"group_name" gorm:"type:varchar(64)"`
        Slogan            string  `json:"slogan" gorm:"type:varchar(255)"`
        MessageToMembers  string  `json:"message_to_members" gorm:"type:text"`
        AvatarUrl         string  `json:"avatar_url" gorm:"type:varchar(255)"`
        DefaultDiscount   float64 `json:"default_discount" gorm:"type:decimal(3,2);default:0.95"`
        RecommendDiscount float64 `json:"recommend_discount" gorm:"type:decimal(3,2);default:0.95"`
        BaseSharePct      float64 `json:"base_share_pct" gorm:"type:decimal(5,2);default:25.00"`
        CurrentSharePct   float64 `json:"current_share_pct" gorm:"type:decimal(5,2);default:25.00"`
        RankBonusUntil    int64   `json:"rank_bonus_until" gorm:"default:0"`
        Status            int     `json:"status" gorm:"type:tinyint;default:1"`
        CreatedTime       int64   `json:"created_time" gorm:"bigint"`
        UpdatedTime       int64   `json:"updated_time" gorm:"bigint"`
  }

  func (g *PromoGroup) TableName() string {
        return "promo_groups"
  }

  func GetPromoGroupById(id int) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("id = ?", id).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  func GetPromoGroupByCode(code string) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("group_code = ?", code).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  func GetPromoGroupByLeader(userId int) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("leader_user_id = ?", userId).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  func (g *PromoGroup) Insert() error {
        g.CreatedTime = common.GetTimestamp()
        g.UpdatedTime = g.CreatedTime
        return DB.Create(g).Error
  }

  func (g *PromoGroup) Update() error {
        g.UpdatedTime = common.GetTimestamp()
        return DB.Save(g).Error
  }
  