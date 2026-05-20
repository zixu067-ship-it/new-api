
package controller


  import (

        "net/http"


        "github.com/QuantumNous/new-api/model"

        "github.com/gin-gonic/gin"

  )


  func DissolveGroup(c *gin.Context) {

        userId := c.GetInt("id")

        if userId == 0 {

                c.JSON(http.StatusOK, gin.H{"success": false, "message": "未登录"})

                return

        }

        var group model.PromoGroup

        if err := model.DB.Where("leader_user_id = ?", userId).First(&group).Error; err != nil {

                c.JSON(http.StatusOK, gin.H{"success": false, "message": "你不是任何小组的组长"})

                return

        }

        tx := model.DB.Begin()

        if err := tx.Where("group_id = ?", group.Id).Delete(&model.PromoMember{}).Error; err != nil {

                tx.Rollback()

                c.JSON(http.StatusOK, gin.H{"success": false, "message": "删除成员失败: " + err.Error()})

                return

        }

        if err := tx.Delete(&group).Error; err != nil {

                tx.Rollback()

                c.JSON(http.StatusOK, gin.H{"success": false, "message": "删除小组失败: " + err.Error()})

                return

        }

        tx.Commit()

        c.JSON(http.StatusOK, gin.H{"success": true, "message": "小组已解散"})

  }

