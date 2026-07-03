package responses

import (
	"time" 
)

type AcaraResponse struct {
	ID             uint      `json:"id"`
	NamaAcara      string    `json:"nama_acara"`
	JumlahTamu     int       `json:"jumlah_tamu"`
	TanggalMulai   time.Time `json:"tanggal_mulai"`
	TanggalSelesai time.Time `json:"tanggal_selesai"`
	KegiatanID     uint      `json:"kegiatan_id"`
	NamaKegiatan   string    `json:"nama_kegiatan"` 
	PelangganId    uint      `json:"pelanggan_id"`
}