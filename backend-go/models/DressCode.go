package models

import "time"

type DressCode struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId    uint      `json:"acara_id"`
	Deskripsi  string    `json:"deskripsi"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (DressCode) TableName() string {
	return "dress_code"
}

type DressCodeDetail struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DressCodeId uint      `json:"dress_code_id"`
	UrlGambar   string    `json:"url_gambar"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (DressCodeDetail) TableName() string {
	return "dress_code_detail"
}