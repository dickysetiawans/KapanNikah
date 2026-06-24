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

)
func isInvalidLength(c *gin.Context, value string, namaField string) bool {
	if len(value) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": namaField + " minimal 3 karakter",
		})
		return true // Artinya: "Ya, ini error/invalid"
	}
	if len(value) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": namaField + " maksimal 100 karakter",
		})
		return true 
	}
	return false
}
func GetFitur(c *gin.Context) {

	var kegiatans []models.Fitur

	config.DB.Select("id","nama_fitur", "harga_fitur", "is_active", "code_fitur").Order("id desc").Find(&kegiatans)

	c.JSON(200, kegiatans)
}
func CreateFitur(c *gin.Context) {
	var input requests.CreateAndUpdateFiturRequest
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Format request tidak valid",
            "error":   err.Error(),
        })
        return
    }
	namaFitur := sanitizeText(input.NamaFitur)
	codeFitur := sanitizeText(input.CodeFitur)
	if isInvalidLength(c, namaFitur, "Nama Fitur") {
		return 
	}
	if isInvalidLength(c, codeFitur, "Kode Fitur") {
		return 
	}
    if input.HargaFitur <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Harga fitur harus lebih dari 0",
        })
        return
    }
    if input.HargaFitur > 999999999 {
        c.JSON(http.StatusBadRequest, gin.H{
           "message": "Code fitur sudah digunakan di kegiatan ini",
        })
        return
    }

    var codeFiturCheck int64
    config.DB.
        Model(&models.Fitur{}).
        Where("code_fitur = ? AND is_active = ? ", input.CodeFitur, true).
        Count(&codeFiturCheck)

    if codeFiturCheck > 0 {

        c.JSON(400, gin.H{
            "message": "Code fitur sudah digunakan",
        })

        return
    }
    tx := config.DB.Begin()

    fitur := models.Fitur{
        NamaFitur: input.NamaFitur,
        CodeFitur: input.CodeFitur,
       	IsActive:  input.IsActive,
        HargaFitur: input.HargaFitur,
        KegiatanId: input.KegiatanId,

    }
    if err := tx.Create(&fitur).Error; err != nil {

        tx.Rollback()

        c.JSON(500, gin.H{
            "message": "Gagal menyimpan Fitur",
        })

        return
    }

    tx.Commit()

    c.JSON(200, gin.H{
        "message": "Fitur berhasil dibuat",
    })
}

func GetFiturByID(c *gin.Context) {
	// ini untuk get id nya
	id := c.Param("id")
		
	var fitur models.Fitur

	err := config.DB.Where("id = ?", id).First(&fitur).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Fitur tidak ditemukan",
		})
		return
	}

	c.JSON(200, fitur)
}

func UpdateFitur(c *gin.Context) {
    id := c.Param("id")

    var input requests.CreateAndUpdateFiturRequest
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Format request tidak valid",
            "error":   err.Error(),
        })
        return
    }

    namaFitur := sanitizeText(input.NamaFitur)
    codeFitur := sanitizeText(input.CodeFitur)
    if isInvalidLength(c, namaFitur, "Nama Fitur") || isInvalidLength(c, codeFitur, "Kode Fitur") {
        return 
    }

    if input.HargaFitur <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Harga fitur harus lebih dari 0"})
        return
    }
    if input.HargaFitur > 999999999 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Harga fitur tidak valid"})
        return
    }

    var codeFiturCheck int64
    config.DB.Model(&models.Fitur{}).
        Where("code_fitur = ? AND is_active = ? AND id != ?", input.CodeFitur, true, id).
        Count(&codeFiturCheck)

    if codeFiturCheck > 0 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Code fitur sudah digunakan"})
        return
    }

    var fitur models.Fitur
    if err := config.DB.Where("id = ?", id).First(&fitur).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "Fitur tidak ditemukan"})
        return
    }

    
    var digunakanDiPaketCount int64
    config.DB.Model(&models.PaketDetailFitur{}).
        Where("fitur_id = ?", id).
        Count(&digunakanDiPaketCount)

    if digunakanDiPaketCount > 0 {
        if !input.IsActive {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Fitur tidak bisa dinonaktifkan karena masih digunakan di dalam detail paket",
            })
            return
        }

        if fitur.HargaFitur != input.HargaFitur || fitur.CodeFitur != input.CodeFitur {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Data fitur tidak dapat diubah karena sudah terikat dengan paket yang aktif",
            })
            return
        }
    }
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    fitur.NamaFitur = input.NamaFitur
    fitur.CodeFitur = input.CodeFitur
    fitur.IsActive = input.IsActive
    fitur.HargaFitur = input.HargaFitur
    fitur.KegiatanId = input.KegiatanId
    
    if err := tx.Save(&fitur).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data fitur"})
        return
    }
    

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan perubahan"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Fitur berhasil diperbarui"})
}

func GetFiturByIDAndIsActive(c *gin.Context) {

    var kegiatans []models.Fitur

    config.DB.Select("id","nama_fitur", "harga_fitur", "is_active", "code_fitur").Where("is_active = ?", true).Order("id desc").Find(&kegiatans)

    c.JSON(200, kegiatans)
}
