package requests

type CreatePaketRequest struct {
    NamaPaket      string  `json:"namaPaket" binding:"required"`
    HargaPaket     float64 `json:"hargaPaket" binding:"required,gt=0"`
    DeskripsiPaket string  `json:"deskripsiPaket" binding:"required"`
}