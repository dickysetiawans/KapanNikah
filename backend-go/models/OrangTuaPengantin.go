package models

type OrangTuaPengantin struct {
	ID             		uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AcaraId   	   		uint      `json:"acara_id"`
	NamaAyahPengantinPria   string    `json:"nama_ayah_pengantin_pria"`
	NamaIbuPengantinPria   string    `json:"nama_ibu_pengantin_pria"`
	NamaAyahPengantinWanita   string    `json:"nama_ayah_pengantin_wanita"`
	NamaIbuPengantinWanita   string    `json:"nama_ibu_pengantin_wanita"`
	
	
	// CreatedAt      time.Time `json:"created_at"`
	// UpdatedAt      time.Time `json:"updated_at"`
}

func (OrangTuaPengantin) TableName() string {
    return "orang_tua_pengantin"
}