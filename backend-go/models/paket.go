package models

type Paket struct {
	ID uint `gorm:"primaryKey"`

	NamaPaket string `json:"nama_paket"`

	HargaPaket float64 `json:"harga_paket"`

	DeskripsiPaket string `json:"deskripsi_paket" gorm:"type:text"`
}