package models

type Undangan struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId   	   uint      `json:"acara_id"`
	NamaAcara      string    `json:"nama_pengunjung"`
	NoHandphone    uint    	 `json:"no_hanphone"`
	
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (Undangan) TableName() string {
    return "undangan"
}