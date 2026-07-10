import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
import { CODE_FITUR } from "../../../Codec/Codec";
import Select from "../../form/Select";
import Switch from "../../form/switch/Switch";

export default function FiturAddForm() {
	const navigate = useNavigate();
	const [namaFitur, setNamaFitur] = useState("");
	const [codeFitur, setCodeFitur] = useState("");
	const [hargaFitur, setHargaFitur] = useState("");
	const [hargaDisplay, setHargaDisplay] = useState("");
	const [kegiatanOptions, setKegiatanOptions] = useState([]);
	const [selectedKegiatan, setSelectedKegiatan] = useState("");
	const [isActive, setIsActive] = useState(true);
	const handleSubmit = async () => {
		if (confirm("Apakah kamu yakin ingin menambah data Fitur ini?")) {
	 		if (!namaFitur.trim()) {
		       alert("Nama Fitur wajib diisi");
		       return;
		     }
		    if (!codeFitur.toString().trim()) {
		      alert("Kode Fitur wajib diisi");
		      return;
		    }
		   	if (!hargaFitur.toString().trim()) {
		        alert("Harga fitur wajib diisi");
		        return;
	      	}
	      	if (!selectedKegiatan.toString().trim()) {
		      alert("Kegiatan wajib diisi");
		      return;
		    }
		    try {
				const token = localStorage.getItem("token");

		        await axios.post(
		          `${import.meta.env.VITE_API_URL}/api/fitur`,
				  {
				    namaFitur: namaFitur,  
				    hargaFitur: Number(hargaFitur), 
				    codeFitur: codeFitur,
				    kegiatanId:Number(selectedKegiatan),
				    isActive: isActive
				  },
				  {
				    headers: { Authorization: `Bearer ${token}` },
				  }
		        );
		    	alert("Berhasil disimpan");
	        	navigate("/fitur");
		    }catch (err) {
		        alert(
		          err.response?.data?.message ||
		          "Gagal simpan"
		        );

		    }

	 	}
	}
	const options = [
	  { value: CODE_FITUR.SHOW_BRIDE_NAME, label: "MNM - Menampilkan Nama Mempelai", selected: false },
	  { value: CODE_FITUR.SHOW_PARENT_NAME, label: "MNOT - Menampilkan Nama Orang Tua", selected: false },
	  { value: CODE_FITUR.SHOW_EVENT_DATE, label: "MTA - Menampilkan Tanggal Acara", selected: false },
	  { value: CODE_FITUR.SHOW_EVENT_LOCATION, label: "MLA - Menampilkan Lokasi Acara", selected: false },
	  { value: CODE_FITUR.SHOW_MAP_LOCATION, label: "GM - Google Maps", selected: false },
	  { value: CODE_FITUR.SHOW_COUNTDOWN, label: "CA - Countdown Acara", selected: false },
	  { value: CODE_FITUR.SHOW_GALLERY, label: "MGFM - Menampilkan Galeri Foto Mempelai", selected: false },
	  { value: CODE_FITUR.SHOW_LOVE_STORY, label: "LS - Love Story", selected: false },
	  { value: CODE_FITUR.SHOW_EVENT_SCHEDULE, label: "JA - Jadwal Acara", selected: false },
	  { value: CODE_FITUR.SHOW_DRESS_CODE, label: "DC - Dress Code", selected: false },
	  { value: CODE_FITUR.SHOW_MUSIC, label: "BM - Background Music", selected: false },
	  { value: CODE_FITUR.SHOW_VIDEO, label: "VP - Video Prewedding", selected: false },
	  { value: CODE_FITUR.SHOW_LIVE_STREAMING, label: "LST - Live Streaming", selected: false },
	  { value: CODE_FITUR.SHOW_RSVP, label: "RSVP - Konfirmasi Kehadiran", selected: false },
	  { value: CODE_FITUR.SHOW_ATTENDANCE, label: "FAK - Fitur Absensi Kehadiran", selected: false },
	  { value: CODE_FITUR.SHOW_GUEST_BOOK, label: "BT - Buku Tamu", selected: false },
	  { value: CODE_FITUR.SHOW_WEDDING_GIFT, label: "WG - Wedding Gift", selected: false },
	  { value: CODE_FITUR.SHOW_QR_CHECKIN, label: "QRC - QR Check-in", selected: false },
	  { value: CODE_FITUR.SHOW_SEAT_NUMBER, label: "NMK - Nomor Meja / Kursi", selected: false },
	  { value: CODE_FITUR.SHOW_INVITATION_TO, label: "NTU - Nama Tamu Undangan", selected: false },
	  { value: CODE_FITUR.SHOW_SHARE_BUTTON, label: "TS - Tombol Share", selected: false },
	  { value: CODE_FITUR.SHOW_HEALTH_PROTOCOL, label: "PK - Protokol Kesehatan", selected: false },
	  { value: CODE_FITUR.SHOW_CONTACT_PERSON, label: "CP - Contact Person", selected: false },
	  { value: CODE_FITUR.SHOW_THANK_YOU_NOTE, label: "UTK - Ucapan Terima Kasih", selected: false },
	  { value: CODE_FITUR.SHOW_VIDEO, label: "VP - Video Prewedding", selected: false },


	];
	const fetchKegiatan = async () => {
	    try {
	      const token = localStorage.getItem("token");
	      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/kegiatan`, {
	        headers: { Authorization: `Bearer ${token}` },
	      });
	      const formattedData = response.data.map((item) => ({
	        value: item.ID, 
	        label: item.nama_kegiatan,
	      }));

	      setKegiatanOptions(formattedData);
	    } catch (err) {
	      console.error("Gagal mengambil data kegiatan:", err);
	    }
	};
	const handleSelectChange = (value) => {
		console.log("Selected value:", value);
		setCodeFitur(value); 
	};	
	const handleHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const raw = e.target.value.replace(/\./g, "");
	  
	  if (isNaN(Number(raw))) return; 
	  
	  setHargaFitur(raw); 
	  setHargaDisplay(Number(raw).toLocaleString("id-ID"));
	};
	useEffect(() => {
	    fetchKegiatan();
	}, []);
	return (
	 	<ComponentCard title="Data Fitur">
	      <div className="space-y-6">
	        <div>
	          <Label htmlFor="namaFitur">Nama Fitur</Label>
	          <Input
	            type="text"
	            value={namaFitur}
	            onChange={(e) => setNamaFitur(e.target.value)}
	            placeholder="Masukan Nama Fitur"
	          />
	        </div>
	        <div>
	          <Label htmlFor="hargaPaket">Harga Fitur</Label>
	          <Input
					type="text"         
					value={hargaDisplay}
					onChange={handleHarga}
					placeholder="Masukan Harga Fitur"
					namePrefix="Rp"
					prefixOn={true}
				/>
	         	
	        </div>
	        <div>
	          <Label>Kode Fitur</Label>
	          <Select
	            options={options}
	            placeholder="Pilih Kode Fitur"
	            onChange={handleSelectChange}
	            className="dark:bg-dark-900"
	          />
	        </div>
	        <div>
		        <Label>Kegiatan</Label>
		        <Select
		          options={kegiatanOptions} // Menggunakan data hasil fetch API
		          placeholder="Pilih Kegiatan"
		          value={selectedKegiatan}
		          onChange={(value) => {
		        
		            setSelectedKegiatan(value);
		          }}
		          className="dark:bg-dark-900"
		        />
		    </div>
		    <div>
	          <Switch
	            label="Aktif"
	            defaultChecked={true}
	            onChange={(checked) => {
	              setIsActive(checked);
	            }}
	          />
	        </div>
	      </div>
	      <div className="mt-6 flex gap-2">
	        <button
	          type="button"
	          onClick={handleSubmit}
	          className="px-4 py-2 bg-green-600 text-white rounded-lg"
	        >
	          Simpan
	        </button>
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