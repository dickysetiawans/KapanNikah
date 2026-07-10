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
    "gorm.io/gorm"


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
 
	hasPengantin := !req.Pengantin.IsEmpty()
	hasOrangTuaPengantin := !req.OrangTuaPengantin.IsEmpty()
 
	// --- Mulai transaksi ---
	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memulai transaksi"})
		return
	}
 
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Terjadi kesalahan tak terduga, perubahan dibatalkan"})
		}
	}()
 
	
	finalSlug, err := resolveUniqueSlugTx(tx, req.Slug)
	if err != nil {
		tx.Rollback()
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
	if err := tx.Create(&acara).Error; err != nil {
		tx.Rollback()
		if strings.Contains(err.Error(), "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{"message": "Slug sudah dipakai, coba lagi"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data acara"})
		return
	}
 
	if hasPengantin {
		pengantin := models.Pengantin{
			AcaraId:             acara.ID,
			NamaPengantinPria:   req.Pengantin.NamaPengantinPria,
			NamaPengantinWanita: req.Pengantin.NamaPengantinWanita,
		}
		if err := tx.Create(&pengantin).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data pengantin"})
			return
		}
	}
 
	if hasOrangTuaPengantin {
		orangTua := models.OrangTuaPengantin{
			AcaraId:                 acara.ID,
			NamaAyahPengantinPria:   req.OrangTuaPengantin.NamaAyahPengantinPria,
			NamaIbuPengantinPria:    req.OrangTuaPengantin.NamaIbuPengantinPria,
			NamaAyahPengantinWanita: req.OrangTuaPengantin.NamaAyahPengantinWanita,
			NamaIbuPengantinWanita:  req.OrangTuaPengantin.NamaIbuPengantinWanita,
		}
		if err := tx.Create(&orangTua).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data orang tua pengantin"})
			return
		}
	}
	if len(req.LoveStory) > 0 {
		loveStories := make([]models.LoveStory, 0, len(req.LoveStory))
		for _, ls := range req.LoveStory {
			tanggal, err := time.Parse("2006-01-02", ls.Tanggal)
			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"message": "Format tanggal love story tidak valid: " + ls.Tanggal})
				return
			}
			loveStories = append(loveStories, models.LoveStory{
				AcaraId:   acara.ID,
				Kategori:  ls.Kategori,
				Tanggal:   tanggal,
				Deskripsi: ls.Deskripsi,
			})
		}
		if err := tx.Create(&loveStories).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data love story"})
			return
		}
	}
 
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan perubahan"})
		return
	}
 
	c.JSON(http.StatusCreated, gin.H{
		"message": "Acara berhasil disimpan",
	})
}
 
func resolveUniqueSlugTx(tx *gorm.DB, baseSlug string) (string, error) {
	slug := baseSlug
	for i := 1; i <= 50; i++ {
		var count int64
		if err := tx.Model(&models.Acara{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, i)
	}
	return "", fmt.Errorf("gagal generate slug unik setelah 50 percobaan")
}
type AcaraDetailResponse struct {
	models.Acara
	Pengantin         *models.Pengantin         `json:"pengantin,omitempty"`
	OrangTuaPengantin *models.OrangTuaPengantin `json:"orang_tua_pengantin,omitempty"`
	LoveStory         []models.LoveStory        `json:"love_story,omitempty"`
}
func GetAcaraByID(c *gin.Context) {
	// ini untuk get id nya
	id := c.Param("id")
		
	var acara models.Acara

	if err := config.DB.Where("id = ?", id).First(&acara).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Acara tidak ditemukan"})
		return
	}

	response := AcaraDetailResponse{Acara: acara}

	var pengantin models.Pengantin
	if err := config.DB.Where("acara_id = ?", acara.ID).First(&pengantin).Error; err == nil {
		response.Pengantin = &pengantin
	}
	
	var orangTua models.OrangTuaPengantin
	if err := config.DB.Where("acara_id = ?", acara.ID).First(&orangTua).Error; err == nil {
		response.OrangTuaPengantin = &orangTua
	}

 	var loveStory []models.LoveStory
	if err := config.DB.Where("acara_id = ?", acara.ID).Order("tanggal asc").Find(&loveStory).Error; err == nil {
		response.LoveStory = loveStory
	}

	c.JSON(http.StatusOK, response)
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
	hasPengantin := !req.Pengantin.IsEmpty()
	hasOrangTuaPengantin := !req.OrangTuaPengantin.IsEmpty()

 	tx := config.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memulai transaksi"})
		return
	}
 
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Terjadi kesalahan tak terduga, perubahan dibatalkan"})
		}
	}()


	finalSlug, err := resolveUniqueSlugForUpdate(tx, req.Slug, existing.ID)
	if err != nil {
		tx.Rollback()
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
 
	if err := tx.Save(&existing).Error; err != nil { 
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data acara"})
		return
	}

 	if hasPengantin {
 		if req.Pengantin.PengantinId == 0 {
			// jika data beluma ada, bakal ngebuat baru
			pengantin := models.Pengantin{
				AcaraId:             existing.ID,
				NamaPengantinPria:   req.Pengantin.NamaPengantinPria,
				NamaPengantinWanita: req.Pengantin.NamaPengantinWanita,
			}
			if err := tx.Create(&pengantin).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data pengantin"})
				return
			}
		}else{
			var pengantins models.Pengantin
			if err := config.DB.Where("id = ?", req.Pengantin.PengantinId).First(&pengantins).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusNotFound, gin.H{"message": "Pengantin tidak ditemukan"})
				return
			}
			pengantins.AcaraId = existing.ID
			pengantins.NamaPengantinPria = req.Pengantin.NamaPengantinPria
			pengantins.NamaPengantinWanita = req.Pengantin.NamaPengantinWanita
			if err := tx.Save(&pengantins).Error; err != nil { 
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data pengantin"})
				return
			}
		}
		
	}
 	// fitur orang tua pengantin
	if hasOrangTuaPengantin {
		if req.OrangTuaPengantin.OrangTuaPengantinId == 0 {
			orangTua := models.OrangTuaPengantin{
				AcaraId:                 existing.ID,
				NamaAyahPengantinPria:   req.OrangTuaPengantin.NamaAyahPengantinPria,
				NamaIbuPengantinPria:    req.OrangTuaPengantin.NamaIbuPengantinPria,
				NamaAyahPengantinWanita: req.OrangTuaPengantin.NamaAyahPengantinWanita,
				NamaIbuPengantinWanita:  req.OrangTuaPengantin.NamaIbuPengantinWanita,
			}
			if err := tx.Create(&orangTua).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data orang tua pengantin"})
				return
			}
		}else{
			var orangTuaPengantins models.OrangTuaPengantin
			if err := config.DB.Where("id = ?", req.OrangTuaPengantin.OrangTuaPengantinId).First(&orangTuaPengantins).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusNotFound, gin.H{"message": "Orang Tua Pengantin tidak ditemukan"})
				return
			}
			orangTuaPengantins.NamaAyahPengantinPria = req.OrangTuaPengantin.NamaAyahPengantinPria
			orangTuaPengantins.NamaIbuPengantinPria = req.OrangTuaPengantin.NamaIbuPengantinPria
			orangTuaPengantins.NamaAyahPengantinWanita = req.OrangTuaPengantin.NamaAyahPengantinWanita
			orangTuaPengantins.NamaIbuPengantinWanita = req.OrangTuaPengantin.NamaIbuPengantinWanita
			if err := tx.Save(&orangTuaPengantins).Error; err != nil { 
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data orang tua pengantin"})
				return
			}
		}
		
	}
	if len(req.LoveStory) > 0 {
		var existingLoveStory []models.LoveStory
		if err := tx.Where("acara_id = ?", existing.ID).Find(&existingLoveStory).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memuat data love story"})
			return
		}

		existingIds := make(map[uint]bool)
		for _, ls := range existingLoveStory {
			existingIds[ls.ID] = true
		}
		submittedIds := make(map[uint]bool)

		for _, item := range req.LoveStory {
			tanggal, err := time.Parse("2006-01-02", item.Tanggal)
			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"message": "Format tanggal love story tidak valid: " + item.Tanggal})
				return
			}

			if item.Id == 0 {
				// belum ada di DB -> insert baru
				newStory := models.LoveStory{
					AcaraId:   existing.ID,
					Kategori:  item.Kategori,
					Tanggal:   tanggal,
					Deskripsi: item.Deskripsi,
				}
				if err := tx.Create(&newStory).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan data love story"})
					return
				}
			} else {
				// sudah ada -> update, tapi pastikan id-nya memang milik acara ini
				if !existingIds[item.Id] {
					tx.Rollback()
					c.JSON(http.StatusNotFound, gin.H{"message": "Love story tidak ditemukan"})
					return
				}
				submittedIds[item.Id] = true
				if err := tx.Model(&models.LoveStory{}).
					Where("id = ? AND acara_id = ?", item.Id, existing.ID).
					Updates(map[string]interface{}{
						"kategori":  item.Kategori,
						"tanggal":   tanggal,
						"deskripsi": item.Deskripsi,
					}).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal memperbarui data love story"})
					return
				}
			}
		}

		for _, ls := range existingLoveStory {
			if !submittedIds[ls.ID] {
				if err := tx.Delete(&models.LoveStory{}, ls.ID).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus love story lama"})
					return
				}
			}
		}
	} else {
		if err := tx.Where("acara_id = ?", existing.ID).Delete(&models.LoveStory{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menghapus data love story"})
			return
		}
	}
 	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan perubahan"})
		return
	}
 
	c.JSON(http.StatusOK, gin.H{
		"message": "Acara berhasil diperbarui",
	})
}
func resolveUniqueSlugForUpdate(tx *gorm.DB, baseSlug string, excludeID uint) (string, error) {
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