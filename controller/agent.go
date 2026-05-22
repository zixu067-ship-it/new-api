package controller

  import (
        "crypto/rand"
        "encoding/hex"
        "net/http"
        "strconv"
        "strings"

        "github.com/QuantumNous/new-api/common"
        "github.com/QuantumNous/new-api/model"
        "github.com/gin-gonic/gin"
  )

  func generateToken(n int) string {
        b := make([]byte, n)
        rand.Read(b)
        return hex.EncodeToString(b)
  }

  func GetAgentProfile(c *gin.Context) {
        userId := c.GetInt("id")
        profile, err := model.GetAgentProfileByUserId(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "未找到代理资料"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": profile})
  }

  func SaveAgentProfile(c *gin.Context) {
        userId := c.GetInt("id")
        var profile model.AgentProfile
        if err := c.ShouldBindJSON(&profile); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误: " + err.Error()})
                return
        }
        profile.UserId = userId
        if profile.RealName == "" || profile.Phone == "" || profile.WechatId == "" {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "姓名、手机号、微信号为必填项"})
                return
        }
        if err := profile.Upsert(); err != nil {
                common.SysError("SaveAgentProfile error: " + err.Error())
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "保存失败，请稍后重试"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "保存成功"})
  }

  func GetMyGroup(c *gin.Context) {
        userId := c.GetInt("id")
        member, err := model.GetPromoMemberByUserId(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "尚未加入任何小组"})
                return
        }
        group, err := model.GetPromoGroupById(member.GroupId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
                return
        }
        members, _ := model.GetPromoMembersByGroup(group.Id)
        c.JSON(http.StatusOK, gin.H{
                "success": true,
                "data": gin.H{
                        "group":     group,
                        "me":        member,
                        "members":   members,
                        "is_leader": member.Role == "leader",
                },
        })
  }

  func GetLeaderProfile(c *gin.Context) {
        userId := c.GetInt("id")
        member, err := model.GetPromoMemberByUserId(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不在任何小组"})
                return
        }
        group, err := model.GetPromoGroupById(member.GroupId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
                return
        }
        profile, err := model.GetAgentProfileByUserId(group.LeaderUserId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组长未填写联系方式"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{
                "real_name":    profile.RealName,
                "phone":        profile.Phone,
                "wechat_id":    profile.WechatId,
                "wechat_qr":    profile.WechatQrUrl,
        }})
  }

  func GetMembersProfiles(c *gin.Context) {
        userId := c.GetInt("id")
        group, err := model.GetPromoGroupByLeader(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        members, _ := model.GetPromoMembersByGroup(group.Id)
        var result []map[string]interface{}
        for _, m := range members {
                if m.Role == "leader" || m.UserId == 0 {
                        continue
                }
                item := map[string]interface{}{
                        "member_id":          m.Id,
                        "user_id":            m.UserId,
                        "share_pct":          m.SharePctInGroup,
                        "share_pct_in_group": m.SharePctInGroup,
                        "status":             m.Status,
                }
                if u, errU := model.GetUserById(m.UserId, false); errU == nil && u != nil {
                        item["username"] = u.Username
                        item["nickname"] = u.DisplayName
                }
                if p, err2 := model.GetAgentProfileByUserId(m.UserId); err2 == nil {
                        item["real_name"] = p.RealName
                        item["phone"] = p.Phone
                        item["wechat"] = p.WechatId
                        item["wechat_id"] = p.WechatId
                        item["wechat_qr_url"] = p.WechatQrUrl
                        item["wechat_qr"] = p.WechatQrUrl
                        item["alipay_qr_url"] = p.AlipayQrUrl
                        item["alipay_qr"] = p.AlipayQrUrl
                        item["payment_qr"] = p.AlipayQrUrl
                }
                result = append(result, item)
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
  }

  func CreateGroup(c *gin.Context) {
        userId := c.GetInt("id")
        if _, err := model.GetAgentProfileByUserId(userId); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "请先填写代理资料"})
                return
        }
        if _, err := model.GetPromoMemberByUserId(userId); err == nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您已在一个小组中"})
                return
        }
        var req struct {
                GroupName         string  `json:"group_name"`
                Slogan            string  `json:"slogan"`
                MessageToMembers  string  `json:"message_to_members"`
                AvatarUrl         string  `json:"avatar_url"`
                DefaultDiscount   float64 `json:"default_discount"`
                RecommendDiscount float64 `json:"recommend_discount"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        if strings.TrimSpace(req.GroupName) == "" {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "请填写小组名称"})
                return
        }
        if req.DefaultDiscount < 0.9 || req.DefaultDiscount > 1.0 {
                req.DefaultDiscount = 0.95
        }
        if req.RecommendDiscount < 0.9 || req.RecommendDiscount > 1.0 {
                req.RecommendDiscount = 0.95
        }
        group := model.PromoGroup{
                LeaderUserId:      userId,
                GroupCode:         generateToken(8),
                GroupName:         req.GroupName,
                Slogan:            req.Slogan,
                MessageToMembers:  req.MessageToMembers,
                AvatarUrl:         req.AvatarUrl,
                DefaultDiscount:   req.DefaultDiscount,
                RecommendDiscount: req.RecommendDiscount,
                BaseSharePct:      25.00,
                CurrentSharePct:   25.00,
                Status:            1,
        }
        if err := group.Insert(); err != nil {
                common.SysError("CreateGroup insert: " + err.Error())
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "创建失败"})
                return
        }
        leader := model.PromoMember{
                GroupId:            group.Id,
                UserId:             userId,
                Role:               "leader",
                SharePctInGroup:    0,
                SharePctOfPlatform: 0,
                Status:             1,
        }
        if err := leader.Insert(); err != nil {
                common.SysError("CreateGroup leader insert: " + err.Error())
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "创建组长记录失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": group})
  }

  func UpdateGroup(c *gin.Context) {
        userId := c.GetInt("id")
        group, err := model.GetPromoGroupByLeader(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        var req struct {
                GroupName         string  `json:"group_name"`
                Slogan            string  `json:"slogan"`
                MessageToMembers  string  `json:"message_to_members"`
                AvatarUrl         string  `json:"avatar_url"`
                DefaultDiscount   float64 `json:"default_discount"`
                RecommendDiscount float64 `json:"recommend_discount"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        if strings.TrimSpace(req.GroupName) != "" {
                group.GroupName = req.GroupName
        }
        group.Slogan = req.Slogan
        group.MessageToMembers = req.MessageToMembers
        group.AvatarUrl = req.AvatarUrl
        if req.DefaultDiscount >= 0.9 && req.DefaultDiscount <= 1.0 {
                group.DefaultDiscount = req.DefaultDiscount
        }
        if req.RecommendDiscount >= 0.9 && req.RecommendDiscount <= 1.0 {
                group.RecommendDiscount = req.RecommendDiscount
        }
        if err := group.Update(); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": group})
  }

  func CreateInvite(c *gin.Context) {
        userId := c.GetInt("id")
        group, err := model.GetPromoGroupByLeader(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        var req struct {
                SharePctInGroup float64 `json:"share_pct_in_group"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        if req.SharePctInGroup <= 0 || req.SharePctInGroup >= 100 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组内分润占比必须在 1-99 之间"})
                return
        }
        members, _ := model.GetPromoMembersByGroup(group.Id)
        used := 0.0
        for _, m := range members {
                if m.Role == "member" && m.Status == 1 && m.UserId > 0 {
                        used += m.SharePctInGroup
                }
        }
        if used+req.SharePctInGroup > 100 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组内分润占比总和不能超过 100%"})
                return
        }
        platformPct := group.CurrentSharePct * req.SharePctInGroup / 100.0
        invite := model.PromoMember{
                GroupId:            group.Id,
                UserId:             0,
                Role:               "member",
                SharePctInGroup:    req.SharePctInGroup,
                SharePctOfPlatform: platformPct,
                InviteToken:        generateToken(16),
                Status:             0,
        }
        if err := invite.Insert(); err != nil {
                common.SysError("CreateInvite insert: " + err.Error())
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "创建邀请失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{
                "invite_token": invite.InviteToken,
                "share_pct":    invite.SharePctInGroup,
        }})
  }

  func GetInviteInfo(c *gin.Context) {
        token := c.Param("token")
        invite, err := model.GetPromoMemberByInviteToken(token)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "邀请链接无效或已过期"})
                return
        }
        if invite.Status == 1 && invite.UserId > 0 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "此邀请已被接受"})
                return
        }
        group, err := model.GetPromoGroupById(invite.GroupId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{
                "group_name":         group.GroupName,
                "slogan":             group.Slogan,
                "avatar_url":         group.AvatarUrl,
                "message_to_members": group.MessageToMembers,
                "share_pct_in_group": invite.SharePctInGroup,
        }})
  }

  func AcceptInvite(c *gin.Context) {
        userId := c.GetInt("id")
        token := c.Param("token")
        if _, err := model.GetAgentProfileByUserId(userId); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "请先填写代理资料"})
                return
        }
        if _, err := model.GetPromoMemberByUserId(userId); err == nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您已在一个小组中"})
                return
        }
        invite, err := model.GetPromoMemberByInviteToken(token)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "邀请链接无效"})
                return
        }
        if invite.Status == 1 && invite.UserId > 0 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "此邀请已被接受"})
                return
        }
        invite.UserId = userId
        invite.Status = 1
        invite.JoinedAt = common.GetTimestamp()
        if err := invite.Update(); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "加入失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "成功加入小组"})
  }

  func UpdateMemberShare(c *gin.Context) {
        userId := c.GetInt("id")
        group, err := model.GetPromoGroupByLeader(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        memberIdStr := c.Param("id")
        memberId, err := strconv.Atoi(memberIdStr)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        var req struct {
                SharePctInGroup float64 `json:"share_pct_in_group"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        if req.SharePctInGroup < 0 || req.SharePctInGroup >= 100 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "分润占比必须在 0-100 之间"})
                return
        }
        members, _ := model.GetPromoMembersByGroup(group.Id)
        var target *model.PromoMember
        used := 0.0
        for _, m := range members {
                if m.UserId == memberId {
                        target = m
                        continue
                }
                if m.Role == "member" && m.Status == 1 && m.UserId > 0 {
                        used += m.SharePctInGroup
                }
        }
        if target == nil || target.Role != "member" {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组员不存在"})
                return
        }
        if used+req.SharePctInGroup > 100 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组内分润占比总和不能超过 100%"})
                return
        }
        target.SharePctInGroup = req.SharePctInGroup
        target.SharePctOfPlatform = group.CurrentSharePct * req.SharePctInGroup / 100.0
        if err := target.Update(); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "更新成功"})
  }

  func LeaveGroup(c *gin.Context) {
        userId := c.GetInt("id")
        member, err := model.GetPromoMemberByUserId(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不在任何小组"})
                return
        }
        if member.Role == "leader" {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组长不能直接退出，请先转让组长"})
                return
        }
        if err := model.DB.Delete(member).Error; err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "退出失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "已退出小组"})
  }

  func KickMember(c *gin.Context) {
        userId := c.GetInt("id")
        if _, err := model.GetPromoGroupByLeader(userId); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        memberIdStr := c.Param("id")
        memberId, err := strconv.Atoi(memberIdStr)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
                return
        }
        var target model.PromoMember
        if err := model.DB.Where("user_id = ?", memberId).First(&target).Error; err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "组员不存在"})
                return
        }
        if target.Role == "leader" {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "不能踢出组长"})
                return
        }
        if err := model.DB.Delete(&target).Error; err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "踢出失败"})
                return
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "已踢出组员"})
  }

  func TransferLeader(c *gin.Context) {
        userId := c.GetInt("id")
        group, err := model.GetPromoGroupByLeader(userId)
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "您不是组长"})
                return
        }
        var req struct {
                NewLeaderUserId int `json:"new_leader_user_id"`
        }
        if err := c.ShouldBindJSON(&req); err != nil || req.NewLeaderUserId == 0 {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "请指定新组长"})
                return
        }
        members, _ := model.GetPromoMembersByGroup(group.Id)
        var newLeaderMember *model.PromoMember
        var oldLeaderMember *model.PromoMember
        for _, m := range members {
                if m.UserId == req.NewLeaderUserId && m.Role == "member" && m.Status == 1 {
                        newLeaderMember = m
                }
                if m.UserId == userId && m.Role == "leader" {
                        oldLeaderMember = m
                }
        }
        if newLeaderMember == nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "指定的新组长不是本组成员"})
                return
        }
        newLeaderMember.Role = "leader"
        newLeaderMember.SharePctInGroup = 0
        newLeaderMember.SharePctOfPlatform = 0
        if err := newLeaderMember.Update(); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新新组长失败"})
                return
        }
        group.LeaderUserId = req.NewLeaderUserId
        if err := group.Update(); err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新小组组长失败"})
                return
        }
        if oldLeaderMember != nil {
                model.DB.Delete(oldLeaderMember)
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "message": "组长转让成功，您已退出小组"})
  }
  func GetAllPromoGroupsAdmin(c *gin.Context) {
        groups, err := model.GetAllPromoGroups()
        if err != nil {
                c.JSON(http.StatusOK, gin.H{"success": false, "message": "查询失败"})
                return
        }
        list := make([]gin.H, 0, len(groups))
        for _, g := range groups {
                leaderProfile, _ := model.GetAgentProfileByUserId(g.LeaderUserId)
                leaderUser, _ := model.GetUserById(g.LeaderUserId, false)
                members, _ := model.GetPromoMembersByGroup(g.Id)
                active := 0
                pending := 0
                for _, m := range members {
                        if m.Status == 1 && m.UserId > 0 {
                                active++
                        } else if m.Status == 0 {
                                pending++
                        }
                }
                var totalEarnings float64
                model.DB.Model(&model.ProfitRecord{}).Where("group_id = ?", g.Id).Select("COALESCE(SUM(group_share_amount), 0)").Scan(&totalEarnings)
                var pendingEarnings float64
                model.DB.Model(&model.ProfitRecord{}).Where("group_id = ? AND settlement_status = ?", g.Id, "pending").Select("COALESCE(SUM(group_share_amount), 0)").Scan(&pendingEarnings)
                item := gin.H{
                        "group":          g,
                        "leader_profile": leaderProfile,
                        "member_count":   active,
                        "pending_invites": pending,
                        "total_earnings": totalEarnings,
                        "pending_earnings": pendingEarnings,
                }
                if leaderUser != nil {
                        item["leader_username"] = leaderUser.Username
                        item["leader_display_name"] = leaderUser.DisplayName
                }
                list = append(list, item)
        }
        c.JSON(http.StatusOK, gin.H{"success": true, "data": list})
  }

func SetGroupSharePct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效ID"})
		return
	}
	var req struct {
		SharePct float64 `json:"share_pct"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
		return
	}
	if req.SharePct < 25 || req.SharePct > 70 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "分红比例必须在 25% ~ 70% 之间"})
		return
	}
	g, err := model.GetPromoGroupById(id)
	if err != nil || g == nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
		return
	}
	g.CurrentSharePct = req.SharePct
	if err := g.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "更新失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": g})
}

func DissolveGroupAdmin(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效ID"})
		return
	}
	g, err := model.GetPromoGroupById(id)
	if err != nil || g == nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
		return
	}
	if err := model.DeletePromoGroup(id); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "解散失败: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
