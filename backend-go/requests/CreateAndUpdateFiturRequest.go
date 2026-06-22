
package requests

type CreateAndUpdateFiturRequest struct {
	NamaFitur   string `json:"namaFitur"`
	CodeFitur   string `json:"codeFitur"`
	IsActive bool   `json:"isActive"`
	HargaFitur     float64 `json:"hargaFitur" binding:"required,gt=0"`
	KegiatanId uint `json:"kegiatanId"`
} 