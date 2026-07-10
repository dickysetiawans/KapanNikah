package models
import (
	"time" 
)
type LoveStory struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId   	  uint      `json:"acara_id"`
	Kategori   	  string    `json:"kategori"`
	Tanggal   	  time.Time `json:"tanggal"`
	Deskripsi     string    `json:"deskripsi"`
	
	
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (LoveStory) TableName() string {
    return "love_story"
}