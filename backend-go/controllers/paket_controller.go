package controllers
 
import (
    "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	// "golang.org/x/crypto/bcrypt"
	"fmt"
 	"regexp"
	// "wedding-backend/helpers"
	"html"
    "net/http"
    "wedding-backend/responses"
    "errors"
    "gorm.io/gorm"
)

func GetPaket(c *gin.Context) {

	var pakets []models.Paket

	config.DB.Select("id","nama_paket", "harga_paket").Order("id desc").Find(&pakets)

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
    if len(namaPaket) < 3 || len(namaPaket) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Nama paket harus antara 3 - 100 karakter"})
        return
    }

    deskripsiPaket := sanitizeHTML(input.DeskripsiPaket)
    if len(deskripsiPaket) < 10 || len(deskripsiPaket) > 5000 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Deskripsi paket harus antara 10 - 5000 karakter"})
        return
    }
    
    if len(input.DetailFitur) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Minimal harus memilih 1 detail fitur",
        })
        return
    }

    fiturMap := make(map[uint]bool)
    for index, item := range input.DetailFitur {
        if item.FiturID == 0 {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": fmt.Sprintf("Fitur pada baris ke-%d tidak boleh kosong", index+1),
            })
            return
        }
        if _, exists := fiturMap[item.FiturID]; exists {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Gagal menyimpan, terdapat fitur yang sama/duplikat dalam satu paket",
            })
            return
        }
        fiturMap[item.FiturID] = true
    }
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var totalHarga float64 = 0
    var detailDataToInsert []models.PaketDetailFitur

    for _, item := range input.DetailFitur {
        var fitur models.Fitur
        
        if err := tx.Where("id = ?", item.FiturID).First(&fitur).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Fitur dengan ID tersebut tidak ditemukan",
            })
            return
        }

        totalHarga += fitur.HargaFitur 

        
        detailDataToInsert = append(detailDataToInsert, models.PaketDetailFitur{
            FiturId:    fitur.ID,
            HargaFitur: fitur.HargaFitur,
           
        })
    }
    if totalHarga <= 0 || totalHarga > 999999999 {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"message": "Total harga paket tidak valid"})
        return
    }

  
    paket := models.Paket{
        NamaPaket:      namaPaket,
        HargaPaket:     totalHarga, 
        DeskripsiPaket: deskripsiPaket,
    }

    if err := tx.Create(&paket).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data paket"})
        return
    }

  
    for _, detail := range detailDataToInsert {
        detail.PaketId = paket.ID 

        if err := tx.Create(&detail).Error; err != nil {
            tx.Rollback() 
            c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan detail fitur paket"})
            return
        }
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses transaksi data"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Paket dan detail berhasil ditambahkan",
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
    if len(namaPaket) < 3 || len(namaPaket) > 100 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Nama paket harus antara 3 - 100 karakter"})
        return
    }

    deskripsiPaket := sanitizeHTML(input.DeskripsiPaket)
    if len(deskripsiPaket) < 10 || len(deskripsiPaket) > 5000 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Deskripsi paket harus antara 10 - 5000 karakter"})
        return
    }

    if len(input.DetailFitur) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"message": "Minimal harus memilih 1 detail fitur"})
        return
    }

  
    fiturMap := make(map[uint]bool)
    var incomingFiturIDs []uint

    for index, item := range input.DetailFitur {
        if item.FiturID == 0 {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": fmt.Sprintf("Fitur pada baris ke-%d tidak boleh kosong", index+1),
            })
            return
        }

        if _, exists := fiturMap[item.FiturID]; exists {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Gagal menyimpan, terdapat fitur yang sama/duplikat dalam satu paket",
            })
            return
        }
        fiturMap[item.FiturID] = true
        incomingFiturIDs = append(incomingFiturIDs, item.FiturID)
    }

    var paket models.Paket
    if err := config.DB.Where("id = ?", id).First(&paket).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "Paket tidak ditemukan"})
        return
    }

    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var totalHarga float64 = 0
    type DetailValidData struct {
        FiturID    uint
        HargaFitur float64
        CodeFitur  string
    }
    var verifiedDetails []DetailValidData

    for _, item := range input.DetailFitur {
        var mFitur models.Fitur
        if err := tx.Where("id = ?", item.FiturID).First(&mFitur).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"message": "Fitur tidak ditemukan di database"})
            return
        }

        totalHarga += mFitur.HargaFitur
        verifiedDetails = append(verifiedDetails, DetailValidData{
            FiturID:    mFitur.ID,
            HargaFitur: mFitur.HargaFitur,
        })
    }

    if totalHarga <= 0 || totalHarga > 999999999 {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"message": "Total harga paket tidak valid"})
        return
    }
    err := tx.Where("paket_id = ? AND fitur_id NOT IN ?", paket.ID, incomingFiturIDs).
        Delete(&models.PaketDetailFitur{}).Error
    if err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyelaraskan detail lama"})
        return
    }

    for _, detail := range verifiedDetails {
        var existingDetail models.PaketDetailFitur
        
        errFind := tx.Where("paket_id = ? AND fitur_id = ?", paket.ID, detail.FiturID).First(&existingDetail).Error

        if errors.Is(errFind, gorm.ErrRecordNotFound) {
            
            newDetail := models.PaketDetailFitur{
                PaketId:    paket.ID,
                FiturId:    detail.FiturID,
                HargaFitur: detail.HargaFitur,
            }
            if err := tx.Create(&newDetail).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menambah detail fitur baru"})
                return
            }
        } else if errFind == nil {
            existingDetail.HargaFitur = detail.HargaFitur
            
            if err := tx.Save(&existingDetail).Error; err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui detail fitur"})
                return
            }
        } else {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses transaksi detail"})
            return
        }
    }

    paket.NamaPaket = namaPaket
    paket.HargaPaket = totalHarga
    paket.DeskripsiPaket = deskripsiPaket

    if err := tx.Save(&paket).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui paket utama"})
        return
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal melakukan commit perubahan"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Paket dan detail berhasil diperbarui",
    })
}

func DeletePaket(c *gin.Context) {
    id := c.Param("id")
    var paket models.Paket
    if err := config.DB.Where("id = ?", id).First(&paket).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "message": "Paket tidak ditemukan",
        })
        return
    }

    // 2. Validasi apakah paket masih digunakan di tabel undangan
    // var undanganCount int64
    // config.DB.Model(&models.Undangan{}).Where("paket_id = ?", id).Count(&undanganCount)
    // if undanganCount > 0 {
    //     c.JSON(http.StatusBadRequest, gin.H{
    //         "message": "Paket tidak dapat dihapus karena masih digunakan oleh pelanggan/undangan lain",
    //     })
    //     return
    // }

    // 3. MULAI TRANSAKSI DATABASE (TX)
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    if err := tx.Where("paket_id = ?", paket.ID).Delete(&models.PaketDetailFitur{}).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal menghapus detail fitur paket",
        })
        return
    }

    if err := tx.Delete(&paket).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal menghapus data paket utama",
        })
        return
    }
    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal memproses transaksi penghapusan",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Paket beserta detail fiturnya berhasil dihapus",
    })
}

func GetDetailFiturByPaketID(c *gin.Context) {

    paketID := c.Param("id")

    var details []responses.PaketDetailFiturResponse

   
    err := config.DB.Table("paket_detail_fitur pdf").
        Select("pdf.id, pdf.paket_id, pdf.fitur_id, f.nama_fitur, f.code_fitur, pdf.harga_fitur").
        Joins("JOIN fitur f ON f.id = pdf.fitur_id").
        Where("pdf.paket_id = ? ", paketID).
        Scan(&details).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Gagal mengambil detail paket: " + err.Error(),
        })
        return
    }

    if len(details) == 0 {
        c.JSON(http.StatusOK, []responses.PaketDetailFiturResponse{})
        return
    }

    c.JSON(http.StatusOK, details)
}