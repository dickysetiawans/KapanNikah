package controllers

import (
    // "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	// "golang.org/x/crypto/bcrypt"
	// "fmt"
 	// "regexp"
	// "wedding-backend/helpers"
	// "html"
    "net/http"
        "fmt"
)


func GetKegiatan(c *gin.Context) {

	var kegiatans []models.Kegiatan

	config.DB.Select("id","nama_kegiatan", "code_kegiatan").Find(&kegiatans)

	c.JSON(200, kegiatans)
}
func CreateKegiatan(c *gin.Context) {
	var input requests.CreateAndUpdateKegiatanRequest
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Format request tidak valid",
            "error":   err.Error(),
        })
        return
    }
	namaKegaitan := sanitizeText(input.NamaKegiatan)
    if len(namaKegaitan) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama Kegiatan minimal 3 karakter",
        })
        return
    }
    if len(namaKegaitan) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama Kegiatan maksimal 100 karakter",
        })
        return
    }

    codeKegiatan := sanitizeText(input.CodeKegiatan)
    if len(codeKegiatan) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Code Kegiatan minimal 3 karakter",
        })
        return
    }
    if len(codeKegiatan) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Code Kegiatan maksimal 100 karakter",
        })
        return
    }
    fmt.Println("Nama Kegiata : ", input.NamaKegiatan)
    // cek Code Kegiatan
    var codeKegiatanCheck int64
    config.DB.
        Model(&models.Kegiatan{}).
        Where("code_kegiatan = ?", input.CodeKegiatan).
        Count(&codeKegiatanCheck)

    if codeKegiatanCheck > 0 {

        c.JSON(400, gin.H{
            "message": "Code kegiatan sudah digunakan",
        })

        return
    }
    tx := config.DB.Begin()

    kegaitan := models.Kegiatan{
        NamaKegiatan: input.NamaKegiatan,
        CodeKegiatan: input.CodeKegiatan,
    }
    if err := tx.Create(&kegaitan).Error; err != nil {

        tx.Rollback()

        c.JSON(500, gin.H{
            "message": "Gagal menyimpan kegiatan",
        })

        return
    }

    tx.Commit()

    c.JSON(200, gin.H{
        "message": "Kegiatan berhasil dibuat",
    })
}

func GetKegiatanByID(c *gin.Context) {
        // ini untuk get id nya
    id := c.Param("id")
        
    var kegiatan models.Kegiatan

    err := config.DB.Where("id = ?", id).First(&kegiatan).Error

    if err != nil {
        c.JSON(404, gin.H{
            "message": "Kegiatan tidak ditemukan",
        })
        return
    }

    c.JSON(200, kegiatan)
}
func UpdateKegiatan(c *gin.Context) {
    id := c.Param("id")

    var input requests.CreateAndUpdateKegiatanRequest

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Format request tidak valid",
            "error":   err.Error(),
        })
        return
    }
    namaKegaitan := sanitizeText(input.NamaKegiatan)
    if len(namaKegaitan) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama Kegiatan minimal 3 karakter",
        })
        return
    }
    if len(namaKegaitan) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama Kegiatan maksimal 100 karakter",
        })
        return
    }

    codeKegiatan := sanitizeText(input.CodeKegiatan)
    if len(codeKegiatan) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Code Kegiatan minimal 3 karakter",
        })
        return
    }
    if len(codeKegiatan) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Code Kegiatan maksimal 100 karakter",
        })
        return
    }
    var codeKegiatanCheck int64

    config.DB.
            Model(&models.Kegiatan{}).
            Where("code_kegiatan = ? AND id != ?", input.CodeKegiatan, id).
            Count(&codeKegiatanCheck)

    if codeKegiatanCheck > 0 {

        c.JSON(400, gin.H{
            "message": "Code Kegiatan sudah digunakan oleh pelanggan lain",
        })

        return
    }

    var kegiatan models.Kegiatan
    if err := config.DB.Where("id = ?  ", id).First(&kegiatan).Error; err != nil {
        c.JSON(404, gin.H{
            "message": "Kegiatan tidak ditemukan",
        })
        return
    }

    tx := config.DB.Begin()

    kegiatan.NamaKegiatan = input.NamaKegiatan
    kegiatan.CodeKegiatan = input.CodeKegiatan

    // Simpan perubahan ke database
    if err := tx.Save(&kegiatan).Error; err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{
            "message": "Gagal memperbarui data kegiatan",
        })
        return
    }

    tx.Commit()

    c.JSON(200, gin.H{
        "message": "Kegiatan berhasil diperbarui",
    })
}