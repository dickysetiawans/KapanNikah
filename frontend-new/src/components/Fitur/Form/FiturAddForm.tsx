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
		{ value: CODE_FITUR.SHOW_BRIDE_NAME, label:  "MNM - Menampilkan Nama Mempelai" , selected: false},
		{ value: CODE_FITUR.SHOW_GALERI, label: "MGFM - Menampilkan Galeri Foto mempelai" , selected: false},
		{ value: CODE_FITUR.ABSENT_ATTANDANCE, label: "FAK - Fitur Absent Kehadiran" , selected: false},
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