package models

import "time"

type BackgroundMusic struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId    uint      `json:"acara_id"`
	UrlMusic   string    `json:"url_music"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (BackgroundMusic) TableName() string {
	return "background_music"
}