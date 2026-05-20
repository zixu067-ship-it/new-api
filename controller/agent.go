package controller

  import (
        "net/http"

        "github.com/QuantumNous/new-api/common"
        "github.com/QuantumNous/new-api/model"
        "github.com/gin-gonic/gin"
  )

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