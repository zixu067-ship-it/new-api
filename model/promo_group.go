package model

  import (
        "github.com/QuantumNous/new-api/common"
  )

  // PromoGroup 推广小组
  type PromoGroup struct {
        Id                 int     `json:"id" gorm:"primaryKey;autoIncrement"`
        LeaderUserId       int     `json:"leader_user_id" gorm:"index;not null"`
        GroupCode          string  `json:"group_code" gorm:"type:varchar(32);uniqueIndex;not null"` // 镜像站URL用
        GroupName          string  `json:"group_name" gorm:"type:varchar(64)"`
        Slogan             string  `json:"slogan" gorm:"type:varchar(255)"`
        MessageToMembers   string  `json:"message_to_members" gorm:"type:text"`
        AvatarUrl          string  `json:"avatar_url" gorm:"type:varchar(255)"`
        DefaultDiscount    float64 `json:"default_discount" gorm:"type:decimal(3,2);default:0.95"`   // 自助充值折扣
        RecommendDiscount  float64 `json:"recommend_discount" gorm:"type:decimal(3,2);default:0.95"` // 推荐充值折扣
        BaseSharePct       float64 `json:"base_share_pct" gorm:"type:decimal(5,2);default:25.00"`    // 基础分润比例(全
        CurrentSharePct    float64 `json:"current_share_pct" gorm:"type:decimal(5,2);default:25.00"` //
  当前分润比例(可被排行榜加成)
        RankBonusUntil     int64   `json:"rank_bonus_until" gorm:"default:0"`                        // 排名加成到期时间
        Status             int     `json:"status" gorm:"type:tinyint;default:1"`                     // 1=正常 0=禁用
        CreatedTime        int64   `json:"created_time" gorm:"bigint"`
        UpdatedTime        int64   `json:"updated_time" gorm:"bigint"`
  }

  func (g *PromoGroup) TableName() string {
        return "promo_groups"
  }

  // GetPromoGroupById 根据ID查询小组
  func GetPromoGroupById(id int) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("id = ?", id).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  // GetPromoGroupByCode 根据 group_code（镜像站标识）查询小组
  func GetPromoGroupByCode(code string) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("group_code = ?", code).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  // GetPromoGroupByLeader 查询某用户作为组长的小组
  func GetPromoGroupByLeader(userId int) (*PromoGroup, error) {
        var g PromoGroup
        err := DB.Where("leader_user_id = ?", userId).First(&g).Error
        if err != nil {
                return nil, err
        }
        return &g, nil
  }

  // Insert 创建新小组
  func (g *PromoGroup) Insert() error {
        g.CreatedTime = common.GetTimestamp()
        g.UpdatedTime = g.CreatedTime
        return DB.Create(g).Error
  }

  // Update 更新小组
  func (g *PromoGroup) Update() error {
        g.UpdatedTime = common.GetTimestamp()
        return DB.Save(g).Error
  }