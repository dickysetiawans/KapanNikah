package controllers

import (
    "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"fmt"
 	"regexp"
	"wedding-backend/helpers"
)

func GetPaket(c *gin.Context) {

	var pakets []models.Paket

	config.DB.Select("nama_paket", "harga_paket").Find(&pakets)

	c.JSON(200, pakets)
}