package controllers

import (
	"os"
	"time"

	"wedding-backend/config"
	"wedding-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	

)

type LoginRequest struct {
	Email string `json:"email"`
	Password string `json:"password"`
}

func Login(c *gin.Context) {

	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(400, gin.H{"message": "Invalid request",})

		return
	}

	var user models.User

	err := config.DB.Where("email = ? ", req.Email).First(&user).Error

	if err != nil {

		c.JSON(400, gin.H{"message": "Email atau Kata Sandi Anda Salah",})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(req.Password),)

	if err != nil {
		c.JSON(400, gin.H{"message": "Email atau Kata Sandi Anda Salah",})
		return
	}
	if !user.IsActive {
		c.JSON(403, gin.H{"message": "Silahkan hubungi admin untuk mengaktifkan akun anda"})
		return
	}
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"id": user.ID,
			"role_id": user.RoleID,
			"exp": time.Now().
				Add(time.Hour * 24).
				Unix(),
		},
	)

	tokenString, _ := token.SignedString(
		[]byte(os.Getenv("JWT_SECRET")),
	)

	c.JSON(200, gin.H{
		"success": true,
		"token": tokenString,
		"user": user,
	})
}