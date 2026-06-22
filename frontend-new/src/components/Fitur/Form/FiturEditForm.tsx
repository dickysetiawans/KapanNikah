import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { CODE_FITUR } from "../../../Codec/Codec";
import Select from "../../form/Select";

export default function FiturEditForm() {
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

	const fetchFiturDetail = () => {
	  const getFiturDetail = async () => {
	    try {
	      const token = localStorage.getItem("token");
	     
	      const response = await axios.get(
	        `${import.meta.env.VITE_API_URL}/api/fitur/${id}`,
	        { headers: { Authorization: `Bearer ${token}` } }
	      );
	      const Fitur = response.data;
	      setNamaFitur(Fitur.nama_fitur || ""); 
    	  setCodeFitur(Fitur.code_fitur || "");
	      setIsActive(Fitur.is_active);
		  setSelectedKegiatan(Fitur.kegiatan_id || "");
		 
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
	  fetchKegiatan();
	  if (id) {
	    fetchFiturDetail(); // ✅ hapus handleHarga(hargaFitur) di sini
	  }
	}, [id]);
	const labelFitur = {
	    [CODE_FITUR.SHOW_BRIDE_NAME]: "MNM - Menampilkan Nama Mempelai",
	    [CODE_FITUR.SHOW_GALERI]: "MGFM - Menampilkan Galeri Foto mempelai",
	    [CODE_FITUR.ABSENT_ATTANDANCE]: "FAK - Fitur Absent Kehadiran",
	};
	const options = [
		{ value: CODE_FITUR.SHOW_BRIDE_NAME, label:  "MNM - Menampilkan Nama Mempelai" , selected: false},
		{ value: CODE_FITUR.SHOW_GALERI, label: "MGFM - Menampilkan Galeri Foto mempelai" , selected: false},
		{ value: CODE_FITUR.ABSENT_ATTANDANCE, label: "FAK - Fitur Absent Kehadiran" , selected: false},
	];
	const handleHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const raw = e.target.value.replace(/\./g, "");
	  
	  if (isNaN(Number(raw))) return; 
	  
	  setHargaFitur(raw); 
	  setHargaDisplay(Number(raw).toLocaleString("id-ID"));
	};
	const handleSelectChange = (value) => {
		console.log("Selected value:", value);
		setCodeFitur(value); 
	};
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

		        await axios.put(
		          `${import.meta.env.VITE_API_URL}/api/fitur/${id}`,
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
	};	
	if (loading) {
	    return (
	      <ComponentCard title="Ubah Paket">
	        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
	      </ComponentCard>
		);
	}
	return (
		<ComponentCard title="Ubah Data Fitur">
			<div className="space-y-6">
		        <div>
		          	<Label htmlFor="namaFitur">Nama Fitur</Label>
		         	<Input
					  type="text"
					  
					  value={namaFitur}
					   onChange={(e) => setNamaFitur(e.target.value)}
	            
					  placeholder="Masukan Nama Fitur"
					  className="bg-gray-50  dark:bg-gray-800"

					/>
		        </div>
		        <div>
		          	<Label htmlFor="hargaFitur">Harga Fitur</Label>
		          	<Input
					  type="text"
					  
					  value={hargaDisplay}
					  
					  placeholder="Masukan Harga Fitur"
					  namePrefix="Rp"
					  prefixOn={true}
					  onChange={handleHarga}
					  className="bg-gray-50 dark:bg-gray-800"
					/>
				</div>
				<div>
			        <Label htmlFor="codeFitur">Kode Fitur</Label>
			        <Select
			            options={options}
			            placeholder="Pilih Kode Fitur"
			            onChange={handleSelectChange}
			            className="dark:bg-dark-900"
			            defaultValue={codeFitur} 
			        />
			    </div>
			    <div>
				  	<Label htmlFor="kegiatan">Kegiatan</Label>
				  	<Select
			          options={kegiatanOptions} 
			          placeholder="Pilih Kegiatan"
			          value={selectedKegiatan}
			          onChange={(value) => {
			        
			            setSelectedKegiatan(value);
			          }}
			          defaultValue={selectedKegiatan} 
			          className="dark:bg-dark-900"
			        />
				</div>
				<div>
			        <Switch
			            label="Aktif"
			            defaultChecked={isActive}
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