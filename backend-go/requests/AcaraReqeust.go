package requests
import (
	"time" 
) 
type NamaPengantinRequest struct {
    NamaPengantinPria 	string `json:"nama_pengantin_pria"`
    NamaPengantinWanita string `json:"nama_pengantin_wanita"`
}
type NamaOrangTuaPengantinRequest struct {
    NamaAyahPengantinPria 	string `json:"nama_ayah_pengantin_pria"`
    NamaIbuPengantinPria 	string `json:"nama_ibu_pengantin_pria"`
    NamaAyahPengantinWanita string `json:"nama_ayah_pengantin_wanita"`
    NamaIbuPengantinWanita string `json:"nama_ibu_pengantin_wanita"`
}
type LoveStoryRequest struct {
	Kategori  string `json:"kategori"`
	Tanggal   string `json:"tanggal"`
	Deskripsi string `json:"deskripsi"`
}
type ContactPersonRequest struct {
	DeskripKontak  string `json:"deskripsi_contact"`
	NoTelpone   string `json:"no_hanphone"`
}
type UcapanTerimakasihRequest struct {
	Ucapan  string `json:"ucapan"`
}
type JadwalAcaraRequest struct {
	DetailAcara  string `json:"detail_acara"`
	Mulai   time.Time `json:"waktu_mulai"`
	Selesai time.Time `json:"waktu_selesai"`
}
type DresscodeReqeust struct {
	Deskripsi string `json:"deskripsi"`
}
type CreateAcaraRequest struct {
	NamaAcara      string    `json:"nama_acara" binding:"required"`
	Slug           string    `json:"slug" binding:"required"`
	PelangganId    uint      `json:"pelanggan_id" binding:"required"`
	KegiatanId     uint      `json:"kegiatan_id" binding:"required"`
	PaketId        uint      `json:"paket_id" binding:"required"`
	JumlahTamu     int       `json:"jumlah_tamu" binding:"required,gt=0"`
	TanggalMulai   time.Time `json:"tanggal_mulai" binding:"required"`
	TanggalSelesai time.Time `json:"tanggal_selesai" binding:"required"`
	Latitude       float64   `json:"latitude" binding:"required"`
	Longitude      float64   `json:"longitude" binding:"required"`
	Pengantin 	   NamaPengantinRequest  `json:"pengantin"`
	OrangTuaPengantin NamaOrangTuaPengantinRequest `json:"orang_tua_pengantin"`
	LoveStory         []LoveStoryRequest           `json:"love_story"`
	ContactPerson ContactPersonRequest  `json:"contact_person"`
	UcapanTerimakasih UcapanTerimakasihRequest  `json:"ucapan_terimakasih"`
	JadwalAcara         []JadwalAcaraRequest           `json:"jadwal_acara"`
	Dresscode DresscodeReqeust `json:"dresscode"`
}

type NamaPengantinUpdateRequest struct {
	PengantinId 		uint   `json:"id"`
    NamaPengantinPria 	string `json:"nama_pengantin_pria"`
    NamaPengantinWanita string `json:"nama_pengantin_wanita"`
}
type NamaOrangTuaPengantinUpdateRequest struct {
	OrangTuaPengantinId 	uint   `json:"id"`
    NamaAyahPengantinPria 	string `json:"nama_ayah_pengantin_pria"`
    NamaIbuPengantinPria 	string `json:"nama_ibu_pengantin_pria"`
    NamaAyahPengantinWanita string `json:"nama_ayah_pengantin_wanita"`
    NamaIbuPengantinWanita 	string `json:"nama_ibu_pengantin_wanita"`
}
type LoveStoryUpdateRequest struct {
	Id        uint   `json:"id"`
	Kategori  string `json:"kategori"`
	Tanggal   string `json:"tanggal"` 
	Deskripsi string `json:"deskripsi"`
}
type ContactPersonUpdateRequest struct {
	ContactPersonId 	uint   `json:"id"`
	DeskripKontak  string `json:"deskripsi_contact"`
	NoTelpone   string `json:"no_hanphone"`
}
type UcapanTerimakasihUpdateRequest struct {
	UcapanTerimakasihId 	uint   `json:"id"`
	Ucapan  string `json:"ucapan"`
}
type JadwalAcaraUpdateRequest struct {
	Id        uint   `json:"id"`
	DetailAcara  string `json:"detail_acara"`
	Mulai   time.Time `json:"waktu_mulai"`
	Selesai time.Time `json:"waktu_selesai"`
}
type DresscodeUpdateReqeust struct {
	DresscodeId 	uint   `json:"id"`
	Deskripsi string `json:"deskripsi"`
}
type UpdateAcaraRequest struct {
	NamaAcara      string    `json:"nama_acara" binding:"required"`
	Slug           string    `json:"slug" binding:"required"`
	PelangganId    uint      `json:"pelanggan_id" binding:"required"`
	KegiatanId     uint      `json:"kegiatan_id" binding:"required"`
	PaketId        uint      `json:"paket_id" binding:"required"`
	JumlahTamu     int       `json:"jumlah_tamu" binding:"required,gt=0"`
	TanggalMulai   time.Time `json:"tanggal_mulai" binding:"required"`
	TanggalSelesai time.Time `json:"tanggal_selesai" binding:"required"`
	Latitude       float64   `json:"latitude" binding:"required"`
	Longitude      float64   `json:"longitude" binding:"required"`
	Pengantin 	   NamaPengantinUpdateRequest  `json:"pengantin"`
	OrangTuaPengantin NamaOrangTuaPengantinUpdateRequest `json:"orang_tua_pengantin"`
	LoveStory         []LoveStoryUpdateRequest           `json:"love_story"`
	ContactPerson ContactPersonUpdateRequest  `json:"contact_person"`
	UcapanTerimakasih UcapanTerimakasihUpdateRequest  `json:"ucapan_terimakasih"`
	JadwalAcara         []JadwalAcaraUpdateRequest           `json:"jadwal_acara"`
	Dresscode DresscodeUpdateReqeust `json:"dresscode"`
}

type GaleriFotoRequest struct {
	Keterangan string `form:"keterangan"`
}