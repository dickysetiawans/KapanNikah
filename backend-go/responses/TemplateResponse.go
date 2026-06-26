package responses

type TemplateResponse struct {
	ID         uint    `json:"id"`
	PaketID    uint    `json:"paket_id"`
	NamaTemplate  string  `json:"NamaTemplate"`  
	CodeTemplate  string  `json:"code_template"`  
	
}