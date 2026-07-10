package models
import (
	"time" 
)
type JadwalAcara struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId   	  uint      `json:"acara_id"`
	DetailAcara   string    `json:"detail_acara"`
	MulaiAcara    time.Time `json:"mulai_acara"`
	SelesaiAcara  time.Time `json:"selesai_acara"`
	
	
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (JadwalAcara) TableName() string {
    return "jadwal_acara"
}