package models

import "time"

type GaleriPengantin struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId    uint      `json:"acara_id"`
	UrlGambar  string    `json:"url_gambar"`
	Keterangan string    `json:"keterangan"`
	Urutan     int       `json:"urutan"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (GaleriPengantin) TableName() string {
	return "galeri_pengantin"
}