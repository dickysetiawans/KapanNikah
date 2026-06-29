package responses

type TemplateResponse struct {
	ID         uint    `json:"id"`
	PaketID    uint    `json:"paket_id"`
	NamaTemplate  string  `json:"nama_template"`  
	CodeTemplate  string  `json:"code_template"`  
	
}