package responses

type PaketDetailFiturResponse struct {
	ID         uint    `json:"id"`
	PaketID    uint    `json:"paket_id"`
	FiturID    uint    `json:"fitur_id"`
	NamaFitur  string  `json:"nama_fitur"`  
	CodeFitur  string  `json:"code_fitur"`  
	HargaFitur float64 `json:"harga_fitur"`
}