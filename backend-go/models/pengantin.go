package models

type Pengantin struct {
	ID             		uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId   	   		uint      `json:"acara_id"`
	NamaPengantinPria   string    `json:"nama_pengantin_pria"`
	NamaPengantinWanita   string    `json:"nama_pengantin_wanita"`
	
	
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (Pengantin) TableName() string {
    return "pengantin"
}