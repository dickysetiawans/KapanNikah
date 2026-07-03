package models
import (
	"time" 
)
type Acara struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PelangganId    uint      `json:"pelanggan_id"`
	KegiatanId     uint      `json:"kegiatan_id"`
	PaketId        uint      `json:"paket_id"`
	JumlahTamu     int       `json:"jumlah_tamu"`
	NamaAcara      string    `json:"nama_acara"`
	TanggalMulai   time.Time `json:"tanggal_mulai"`
	TanggalSelesai time.Time `json:"tanggal_selesai"`
	Latitude       float64   `gorm:"type:numeric(10,8)" json:"latitude"`
	Longitude      float64   `gorm:"type:numeric(11,8)" json:"longitude"`
	Slug      	   string    `json:"slug"`
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (Acara) TableName() string {
    return "acara"
}