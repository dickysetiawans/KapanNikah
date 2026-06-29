package models

type Template struct {

	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`
	PaketId uint `json:"paket_id"`
	NamaTemplate string `json:"nama_template"`
	CodeTemplate string `json:"code_template"`

}

func (Template) TableName() string {
    return "template"
}