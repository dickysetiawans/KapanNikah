package models

import "time"

type UcapanTerimakasih struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId    uint      `json:"acara_id"`
	Ucapan     string    `json:"ucapan"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (UcapanTerimakasih) TableName() string {
	return "ucapan_terimakasih"
}