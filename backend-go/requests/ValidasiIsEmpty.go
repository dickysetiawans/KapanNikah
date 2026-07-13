package requests

import "strings"

func (p NamaPengantinRequest) IsEmpty() bool {
	return strings.TrimSpace(p.NamaPengantinPria) == "" &&
		strings.TrimSpace(p.NamaPengantinWanita) == ""
}

func (o NamaOrangTuaPengantinRequest) IsEmpty() bool {
	return strings.TrimSpace(o.NamaAyahPengantinPria) == "" &&
		strings.TrimSpace(o.NamaIbuPengantinPria) == "" &&
		strings.TrimSpace(o.NamaAyahPengantinWanita) == "" &&
		strings.TrimSpace(o.NamaIbuPengantinWanita) == ""
}

func (p NamaPengantinUpdateRequest) IsEmpty() bool {
	return strings.TrimSpace(p.NamaPengantinPria) == "" &&
		strings.TrimSpace(p.NamaPengantinWanita) == ""
}

func (o NamaOrangTuaPengantinUpdateRequest) IsEmpty() bool {
	return strings.TrimSpace(o.NamaAyahPengantinPria) == "" &&
		strings.TrimSpace(o.NamaIbuPengantinPria) == "" &&
		strings.TrimSpace(o.NamaAyahPengantinWanita) == "" &&
		strings.TrimSpace(o.NamaIbuPengantinWanita) == ""
}

func (p ContactPersonRequest) IsEmpty() bool {
	return strings.TrimSpace(p.DeskripKontak) == "" &&
		strings.TrimSpace(p.NoTelpone) == ""
}

func (o UcapanTerimakasihRequest) IsEmpty() bool {
	return strings.TrimSpace(o.Ucapan) == ""
	
}


func (p ContactPersonUpdateRequest) IsEmpty() bool {
	return strings.TrimSpace(p.DeskripKontak) == "" &&
		strings.TrimSpace(p.NoTelpone) == ""
}

func (o UcapanTerimakasihUpdateRequest) IsEmpty() bool {
	return strings.TrimSpace(o.Ucapan) == ""
	
}