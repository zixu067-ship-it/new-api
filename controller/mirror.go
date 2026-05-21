package controller

import (
	"net/http"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// GetMirrorGroupInfo 公开接口：根据 group_code 返回镜像站基本信息（小组名、折扣等）
// 用于镜像站前端横幅展示，不需要登录
func GetMirrorGroupInfo(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "group_code 不能为空"})
		return
	}
	g, err := model.GetPromoGroupByCode(code)
	if err != nil || g == nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "小组不存在"})
		return
	}
	discount := g.DefaultDiscount
	if discount <= 0 || discount > 1 {
		discount = 1.0
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"group_code": g.GroupCode,
			"group_name": g.GroupName,
			"discount":   discount,
		},
	})
}
