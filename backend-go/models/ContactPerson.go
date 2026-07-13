package models

import "time"

type ContactPerson struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId    uint      `json:"acara_id"`
	Deskripsi  string    `json:"deskripsi"`
	NoHanphone string    `json:"no_hanphone"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (ContactPerson) TableName() string {
	return "contact_person"
}