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
	    [CODE_FITUR.SHOW_GALERI]: "MGFM - Menampilkan Galeri Foto mempelai",
	    [CODE_FITUR.ABSENT_ATTANDANCE]: "FAK - Fitur Absent Kehadiran",
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