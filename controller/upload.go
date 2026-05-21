package controller

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const uploadRoot = "/data/uploads"
const maxUploadBytes = 5 * 1024 * 1024 // 5MB

var allowedImageExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
}

func randHex(n int) string {
	b := make([]byte, n)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "未找到上传文件"})
		return
	}
	defer file.Close()

	if header.Size > maxUploadBytes {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "文件大于 5MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExt[ext] {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "仅支持 jpg/png/gif/webp"})
		return
	}

	now := time.Now()
	dir := filepath.Join(uploadRoot, fmt.Sprintf("%04d-%02d", now.Year(), int(now.Month())))
	if err := os.MkdirAll(dir, 0755); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "目录创建失败"})
		return
	}

	name := randHex(16) + ext
	dst := filepath.Join(dir, name)
	out, err := os.Create(dst)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "文件写入失败"})
		return
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "文件写入失败"})
		return
	}

	url := fmt.Sprintf("/uploads/%04d-%02d/%s", now.Year(), int(now.Month()), name)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"url": url}})
}
