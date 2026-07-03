package controllers
import (
    // "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	"time"
	"strings"
	// "golang.org/x/crypto/bcrypt"
	"fmt"
 	// "regexp"
	// "wedding-backend/helpers"
	// "html"
    "net/http"
    	"wedding-backend/responses"


)

func GetAcara(c *gin.Context) {
	var acaras []responses.AcaraResponse

	err := config.DB.Table("acara a").
		Select("a.id, a.nama_acara, a.jumlah_tamu, a.tanggal_mulai, a.tanggal_selesai, a.kegiatan_id, k.nama_kegiatan").
		Joins("LEFT JOIN kegiatan k ON k.id = a.kegiatan_id"). 
		Order("a.id desc").
		Scan(&acaras).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal mengambil data acara: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, acaras)
}
func CreateAcara(c *gin.Context) {
	var req requests.CreateAcaraRequest 
 
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid: " + err.Error()})
		return
	} 

	if !req.TanggalMulai.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Waktu mulai tidak boleh sebelum waktu sekarang"})
		return
	}
	if !req.TanggalSelesai.After(req.TanggalMulai) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Waktu selesai harus setelah waktu mulai"})
		return
	}
 
	var pelanggan struct {
		ID       uint
		IsActive bool
	}
	err := config.DB.Table("users").Select("id, is_active").Where("id = ?", req.PelangganId).Scan(&pelanggan).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memvalidasi pelanggan"})
		return
	}
	if pelanggan.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Pelanggan tidak ditemukan"})
		return
	}
	if !pelanggan.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Pelanggan tidak aktif, tidak bisa membuat acara"})
		return
	}
 
	var countKegiatan, countPaket int64
	config.DB.Table("kegiatan").Where("id = ?", req.KegiatanId).Count(&countKegiatan)
	if countKegiatan == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Kegiatan tidak ditemukan"})
		return
	}
	config.DB.Table("paket").Where("id = ?", req.PaketId).Count(&countPaket)
	if countPaket == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Paket tidak ditemukan"})
		return
	}
 
	
	var countBentrok int64
	config.DB.Model(&models.Acara{}).
		Where("pelanggan_id = ?", req.PelangganId).
		Where("tanggal_mulai < ?", req.TanggalSelesai).
		Where("tanggal_selesai > ?", req.TanggalMulai).
		Count(&countBentrok)
	if countBentrok > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "Pelanggan ini sudah punya acara lain yang waktunya beririsan dengan jadwal yang dipilih"})
		return
	}
 
	
	finalSlug, err := resolveUniqueSlug(req.Slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses slug"})
		return
	}
 
	acara := models.Acara{
		NamaAcara:      req.NamaAcara,
		Slug:           finalSlug,
		PelangganId:    req.PelangganId,
		KegiatanId:     req.KegiatanId,
		PaketId:        req.PaketId,
		JumlahTamu:     req.JumlahTamu,
		TanggalMulai:   req.TanggalMulai,
		TanggalSelesai: req.TanggalSelesai,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
	}
 

	if err := config.DB.Create(&acara).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{"message": "Slug sudah dipakai, coba lagi"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data acara"})
		return
	}
 
	c.JSON(http.StatusCreated, gin.H{
		"message": "Acara berhasil disimpan",
		"data":    acara,
	})
}
 
func resolveUniqueSlug(baseSlug string) (string, error) {
	slug := baseSlug
	for i := 1; i <= 50; i++ {
		var count int64
		if err := config.DB.Model(&models.Acara{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, i)
	}
	return "", fmt.Errorf("gagal generate slug unik setelah 50 percobaan")
}

func GetAcaraByID(c *gin.Context) {
	// ini untuk get id nya
	id := c.Param("id")
		
	var Acara models.Acara

	err := config.DB.Where("id = ?", id).First(&Acara).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Acara tidak ditemukan",
		})
		return
	}

	c.JSON(200, Acara)
}
func UpdateAcara(c *gin.Context) {
	idParam := c.Param("id")
 
	var existing models.Acara
	if err := config.DB.Where("id = ?", idParam).First(&existing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Acara tidak ditemukan"})
		return
	}
 
	
	if existing.TanggalMulai.Before(time.Now()) {
		c.JSON(http.StatusConflict, gin.H{"message": "Acara ini sudah lewat waktu mulainya dan tidak bisa diedit lagi"})
		return
	}
 
	
	var req requests.UpdateAcaraRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid: " + err.Error()})
		return
	}
 
	
	if !req.TanggalSelesai.After(req.TanggalMulai) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Waktu selesai harus setelah waktu mulai"})
		return
	}
 
	var pelanggan struct {
		ID       uint
		IsActive bool
	}
	
	err := config.DB.Table("users").Select("id, is_active").Where("id = ?", req.PelangganId).Scan(&pelanggan).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memvalidasi pelanggan"})
		return
	}
	if pelanggan.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Pelanggan tidak ditemukan"})
		return
	}
	if !pelanggan.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Pelanggan tidak aktif, tidak bisa mengubah acara"})
		return
	}
 
	var countKegiatan, countPaket int64
	config.DB.Table("kegiatan").Where("id = ?", req.KegiatanId).Count(&countKegiatan)
	if countKegiatan == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Kegiatan tidak ditemukan"})
		return
	}
	config.DB.Table("paket").Where("id = ?", req.PaketId).Count(&countPaket)
	if countPaket == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Paket tidak ditemukan"})
		return
	}
	var countBentrok int64
	config.DB.Model(&models.Acara{}).
		Where("id != ?", existing.ID).
		Where("pelanggan_id = ?", req.PelangganId).
		Where("tanggal_mulai < ?", req.TanggalSelesai).
		Where("tanggal_selesai > ?", req.TanggalMulai).
		Count(&countBentrok)
	if countBentrok > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "Pelanggan ini sudah punya acara lain yang waktunya beririsan dengan jadwal yang dipilih"})
		return
	}
 
	
	finalSlug, err := resolveUniqueSlugForUpdate(req.Slug, existing.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memproses slug"})
		return
	}

	existing.NamaAcara = req.NamaAcara
	existing.Slug = finalSlug
	existing.PelangganId = req.PelangganId
	existing.KegiatanId = req.KegiatanId
	existing.PaketId = req.PaketId
	existing.JumlahTamu = req.JumlahTamu
	existing.TanggalMulai = req.TanggalMulai
	existing.TanggalSelesai = req.TanggalSelesai
	existing.Latitude = req.Latitude
	existing.Longitude = req.Longitude
 
	if err := config.DB.Save(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data acara"})
		return
	}
 
	c.JSON(http.StatusOK, gin.H{
		"message": "Acara berhasil diperbarui",
		"data":    existing,
	})
}
func resolveUniqueSlugForUpdate(baseSlug string, excludeID uint) (string, error) {
	slug := baseSlug
	for i := 1; i <= 50; i++ {
		var count int64
		if err := config.DB.Model(&models.Acara{}).
			Where("slug = ? AND id != ?", slug, excludeID).
			Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, i)
	}
	return "", fmt.Errorf("gagal generate slug unik setelah 50 percobaan")
}