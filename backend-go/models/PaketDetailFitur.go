package models

type PaketDetailFitur struct {

	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	PaketId uint `json:"paket_id"`
	FiturId uint `json:"fitur_id"`
	HargaFitur float64 `json:"harga_fitur"`


}

func (PaketDetailFitur) TableName() string {
    return "paket_detail_fitur"
}