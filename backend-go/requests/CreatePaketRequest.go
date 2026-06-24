package requests

type DetailFiturRequest struct {
    FiturID uint `json:"fitur_id" binding:"required"`
    HargaFitur     float64 `json:"hargaFitur" binding:"required,gt=0"`
}

type CreatePaketRequest struct {
    NamaPaket      string               `json:"namaPaket" binding:"required"`
    DeskripsiPaket string               `json:"deskripsiPaket" binding:"required"`
    HargaPaket     float64 `json:"hargaPaket" binding:"required,gt=0"`
    DetailFitur    []DetailFiturRequest `json:"detail_fitur" binding:"required,dive,required"`
}