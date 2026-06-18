package controllers

import (
    "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	// "golang.org/x/crypto/bcrypt"
	// "fmt"
 	"regexp"
	// "wedding-backend/helpers"
	"html"
    "net/http"
)

func GetPaket(c *gin.Context) {

	var pakets []models.Paket

	config.DB.Select("id","nama_paket", "harga_paket").Find(&pakets)

	c.JSON(200, pakets)
}

func sanitizeHTML(input string) string {
   
    allowedTags := regexp.MustCompile(`(?i)<(/?)?(b|i|u|s|strong|em|ul|ol|li|p|br|h[1-6]|blockquote)(\s[^>]*)?>`)
    stripped := regexp.MustCompile(`<[^>]*>`).ReplaceAllStringFunc(input, func(tag string) string {
        if allowedTags.MatchString(tag) {
            return tag 
        }
        return "" 
    })

    return strings.TrimSpace(stripped)
}

func sanitizeText(input string) string {
   
    cleaned := html.EscapeString(input)
    cleaned = strings.TrimSpace(cleaned)
    return cleaned
}
func CreatePaket(c *gin.Context) {
	var input requests.CreatePaketRequest

    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Data tidak valid: " + err.Error(),
        })
        return
    }
    namaPaket := sanitizeText(input.NamaPaket)
    if len(namaPaket) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama paket minimal 3 karakter",
        })
        return
    }
    if len(namaPaket) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama paket maksimal 100 karakter",
        })
        return
    }
    if input.HargaPaket <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Harga paket harus lebih dari 0",
        })
        return
    }
    if input.HargaPaket > 999999999 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Harga paket tidak valid",
        })
        return
    }

    deskripsiPaket := sanitizeHTML(input.DeskripsiPaket)
    if len(deskripsiPaket) < 10 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Deskripsi paket minimal 10 karakter",
        })
        return
    }
    if len(deskripsiPaket) > 5000 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Deskripsi paket maksimal 5000 karakter",
        })
        return
    }

    // Simpan ke DB
    paket := models.Paket{
        NamaPaket:      namaPaket,
        HargaPaket:     input.HargaPaket,
        DeskripsiPaket: deskripsiPaket,
    }

    if err := config.DB.Create(&paket).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal menyimpan data",
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Paket berhasil ditambahkan",
        "data":    paket,
    })
}

func GetPaketByID(c *gin.Context) {
		// ini untuk get id nya
	id := c.Param("id")
		
	var paket models.Paket

	err := config.DB.Where("id = ?", id).First(&paket).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Paket tidak ditemukan",
		})
		return
	}

	c.JSON(200, paket)
}
func UpdatePaket(c *gin.Context) {

    id := c.Param("id")

    var input requests.CreatePaketRequest
	
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Data tidak valid: " + err.Error(),
        })
        return
    }
    namaPaket := sanitizeText(input.NamaPaket)
    if len(namaPaket) < 3 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama paket minimal 3 karakter",
        })
        return
    }
    if len(namaPaket) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Nama paket maksimal 100 karakter",
        })
        return
    }
    if input.HargaPaket <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Harga paket harus lebih dari 0",
        })
        return
    }
    if input.HargaPaket > 999999999 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Harga paket tidak valid",
        })
        return
    }

    deskripsiPaket := sanitizeHTML(input.DeskripsiPaket)
    if len(deskripsiPaket) < 10 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Deskripsi paket minimal 10 karakter",
        })
        return
    }
    if len(deskripsiPaket) > 5000 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Deskripsi paket maksimal 5000 karakter",
        })
        return
    }
	var paket models.Paket
    if err := config.DB.Where("id = ?", id).First(&paket).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "message": "Paket tidak ditemukan",
        })
        return
    }
	tx := config.DB.Begin()

    paket.NamaPaket     = namaPaket
    paket.HargaPaket    = input.HargaPaket
    paket.DeskripsiPaket = deskripsiPaket

    if err := tx.Save(&paket).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal memperbarui paket",
        })
        return
    }

    tx.Commit()

    c.JSON(http.StatusOK, gin.H{
        "message": "Paket berhasil diperbarui",
    })

}

func DeletePaket(c *gin.Context) {

    id := c.Param("id")

    // Cek paket ada atau tidak
    var paket models.Paket
    if err := config.DB.Where("id = ?", id).First(&paket).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "message": "Paket tidak ditemukan",
        })
        return
    }

    // TODO: Validasi apakah paket masih digunakan di tabel undangan
    // var undanganCount int64
    // config.DB.Model(&models.Undangan{}).Where("paket_id = ?", id).Count(&undanganCount)
    // if undanganCount > 0 {
    //     c.JSON(http.StatusBadRequest, gin.H{
    //         "message": "Paket tidak dapat dihapus karena masih digunakan oleh undangan lain",
    //     })
    //     return
    // }

    if err := config.DB.Delete(&paket).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal menghapus paket",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Paket berhasil dihapus",
    })
}
