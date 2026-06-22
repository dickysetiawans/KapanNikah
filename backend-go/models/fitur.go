package models

type Fitur struct {

	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	NamaFitur string `json:"nama_fitur"`
	HargaFitur float64 `json:"harga_fitur"`
	KegiatanId uint `json:"kegiatan_id"`
	CodeFitur string `json:"code_fitur"`
	IsActive bool `json:"is_active"`
}

func (Fitur) TableName() string {
    return "fitur"
}