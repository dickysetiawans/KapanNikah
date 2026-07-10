import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { CODE_FITUR } from "../../../Codec/Codec";
export default function FiturViewForm() {
	const navigate = useNavigate();
	const { id } = useParams(); 
	const [namaFitur, setNamaFitur] = useState("");
	const [codeFitur, setCodeFitur] = useState("");
	const [hargaFitur, setHargaFitur] = useState("");
	const [hargaDisplay, setHargaDisplay] = useState("");
	const [kegiatanOptions, setKegiatanOptions] = useState([]);
	const [selectedKegiatan, setSelectedKegiatan] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(true);
	const [namaKegiatanTerpilih, setNamaKegiatanTerpilih] = useState("");

	// Get Kegiatan
	const fetchAllKegiatan = async () => {
	  try {
	    const token = localStorage.getItem("token");
	    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/kegiatan`, {
	      headers: { Authorization: `Bearer ${token}` }
	    });
	    return response.data; // Mengembalikan array daftar kegiatan
	  } catch (err) {
	    console.error("Gagal memuat daftar kegiatan", err);
	    return [];
	  }
	};

	const fetchFiturDetail = () => {
	  const getFiturDetail = async () => {
	    try {
	      const token = localStorage.getItem("token");
	      const daftarKegiatan = await fetchAllKegiatan();
	      const response = await axios.get(
	        `${import.meta.env.VITE_API_URL}/api/fitur/${id}`,
	        { headers: { Authorization: `Bearer ${token}` } }
	      );
	      const Fitur = response.data;
	      setNamaFitur(Fitur.nama_fitur || ""); 
    	  setCodeFitur(Fitur.code_fitur || "");
	      setIsActive(Fitur.is_active);
		  setSelectedKegiatan(Fitur.kegiatan_id || "");
		  const kegiatanCocok = daftarKegiatan.find(item => item.ID === Fitur.kegiatan_id || item.id === Fitur.kegiatan_id);
		  if (kegiatanCocok) {
		    setNamaKegiatanTerpilih(kegiatanCocok.nama_kegiatan);
		  }

	      // ✅ Set hargaFitur dan hargaDisplay langsung di sini
	      const raw = String(Fitur.harga_fitur).replace(/\./g, "");
	      setHargaFitur(raw);
	      setHargaDisplay(Number(raw).toLocaleString("id-ID"));
		  
	    } catch (err) {
	      console.error(err);
	      alert(err.response?.data?.message || "Gagal memuat data Fitur");
	      navigate("/fitur");
	    } finally {
	      setLoading(false);
	    }
	  };
	  getFiturDetail();
	};

	useEffect(() => {
	  if (id) {
	    fetchFiturDetail(); // ✅ hapus handleHarga(hargaFitur) di sini
	  }
	}, [id]);
	const labelFitur = {
	  [CODE_FITUR.SHOW_BRIDE_NAME]: "MNM - Menampilkan Nama Mempelai",
	  [CODE_FITUR.SHOW_PARENT_NAME]: "MNOT - Menampilkan Nama Orang Tua",
	  [CODE_FITUR.SHOW_EVENT_DATE]: "MTA - Menampilkan Tanggal Acara",
	  [CODE_FITUR.SHOW_EVENT_LOCATION]: "MLA - Menampilkan Lokasi Acara",
	  [CODE_FITUR.SHOW_MAP_LOCATION]: "GM - Google Maps",
	  [CODE_FITUR.SHOW_COUNTDOWN]: "CA - Countdown Acara",
	  [CODE_FITUR.SHOW_GALLERY]: "MGFM - Menampilkan Galeri Foto Mempelai",
	  [CODE_FITUR.SHOW_LOVE_STORY]: "LS - Love Story",
	  [CODE_FITUR.SHOW_EVENT_SCHEDULE]: "JA - Jadwal Acara",
	  [CODE_FITUR.SHOW_DRESS_CODE]: "DC - Dress Code",
	  [CODE_FITUR.SHOW_MUSIC]: "BM - Background Music",
	  [CODE_FITUR.SHOW_LIVE_STREAMING]: "LST - Live Streaming",
	  [CODE_FITUR.SHOW_RSVP]: "RSVP - Konfirmasi Kehadiran",
	  [CODE_FITUR.SHOW_ATTENDANCE]: "FAK - Fitur Absensi Kehadiran",
	  [CODE_FITUR.SHOW_GUEST_BOOK]: "BT - Buku Tamu",
	  [CODE_FITUR.SHOW_WEDDING_GIFT]: "WG - Wedding Gift",
	  [CODE_FITUR.SHOW_QR_CHECKIN]: "QRC - QR Check-in",
	  [CODE_FITUR.SHOW_SEAT_NUMBER]: "NMK - Nomor Meja / Kursi",
	  [CODE_FITUR.SHOW_INVITATION_TO]: "NTU - Nama Tamu Undangan",
	  [CODE_FITUR.SHOW_SHARE_BUTTON]: "TS - Tombol Share",
	  [CODE_FITUR.SHOW_HEALTH_PROTOCOL]: "PK - Protokol Kesehatan",
	  [CODE_FITUR.SHOW_CONTACT_PERSON]: "CP - Contact Person",
	  [CODE_FITUR.SHOW_THANK_YOU_NOTE]: "UTK - Ucapan Terima Kasih",
	  [CODE_FITUR.SHOW_VIDEO]: "VP - Video Prewedding",
	};
	if (loading) {
	    return (
	      <ComponentCard title="Detail Paket">
	        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
	      </ComponentCard>
		);
	}
	return (
		<ComponentCard title="Detail Data Fitur">
			<div className="space-y-6">
		        <div>
		          	<Label htmlFor="namaFitur">Nama Fitur</Label>
		         	<Input
					  type="text"
					  readOnly
					  value={namaFitur}
					  onChange={() => {}} 
					  placeholder="Masukan Nama Fitur"
					  className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"

					/>
		        </div>
		        <div>
		          	<Label htmlFor="hargaFitur">Harga Fitur</Label>
		          	<Input
					  type="text"
					  readOnly
					  value={hargaDisplay}
					  onChange={() => {}}  
					  placeholder="Masukan Harga Fitur"
					  namePrefix="Rp"
					  prefixOn={true}
					  className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
					/>
				</div>
				<div>
			        <Label htmlFor="codeFitur">Kode Fitur</Label>
			        <Input
			          type="text"
			          readOnly
			          // Memetakan kode 'ABSENT_ATTANDANCE' jadi 'Fitur Absent Kehadiran'
			          value={labelFitur[codeFitur] || codeFitur} 
			          onChange={() => {}} 
			          className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
			        />
			    </div>
			    <div>
				  <Label htmlFor="kegiatan">Kegiatan</Label>
				  <Input
				    type="text"
				    readOnly
				    value={namaKegiatanTerpilih || "Memuat kegiatan..."}
				    onChange={() => {}} 
				    className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
				  />
				</div>
				<div>
		          <Switch
		            label="Aktif"
		            defaultChecked={isActive} 
		           	checked={isActive}
		            disabled={true} 
		          />
		        </div>
		      </div>
		    <div className="mt-6 flex gap-2">
		        <a href="/fitur">
		          <button
		            type="button"
		            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
		          >
		            Kembali
		          </button>
		        </a>
		    </div>
		</ComponentCard>
	);
}