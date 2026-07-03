package requests
import (
	"time" 
)
type CreateAcaraRequest struct {
	NamaAcara      string    `json:"nama_acara" binding:"required"`
	Slug           string    `json:"slug" binding:"required"`
	PelangganId    uint      `json:"pelanggan_id" binding:"required"`
	KegiatanId     uint      `json:"kegiatan_id" binding:"required"`
	PaketId        uint      `json:"paket_id" binding:"required"`
	JumlahTamu     int       `json:"jumlah_tamu" binding:"required,gt=0"`
	TanggalMulai   time.Time `json:"tanggal_mulai" binding:"required"`
	TanggalSelesai time.Time `json:"tanggal_selesai" binding:"required"`
	Latitude       float64   `json:"latitude" binding:"required"`
	Longitude      float64   `json:"longitude" binding:"required"`
}

type UpdateAcaraRequest struct {
	NamaAcara      string    `json:"nama_acara" binding:"required"`
	Slug           string    `json:"slug" binding:"required"`
	PelangganId    uint      `json:"pelanggan_id" binding:"required"`
	KegiatanId     uint      `json:"kegiatan_id" binding:"required"`
	PaketId        uint      `json:"paket_id" binding:"required"`
	JumlahTamu     int       `json:"jumlah_tamu" binding:"required,gt=0"`
	TanggalMulai   time.Time `json:"tanggal_mulai" binding:"required"`
	TanggalSelesai time.Time `json:"tanggal_selesai" binding:"required"`
	Latitude       float64   `json:"latitude" binding:"required"`
	Longitude      float64   `json:"longitude" binding:"required"`
}