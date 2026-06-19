package models

type Kegiatan struct {
	ID uint `gorm:"primaryKey"`

	NamaKegiatan string `json:"nama_kegiatan"`

	CodeKegiatan string `json:"code_kegiatan"`


}

func (Kegiatan) TableName() string {
    return "kegiatan"
}