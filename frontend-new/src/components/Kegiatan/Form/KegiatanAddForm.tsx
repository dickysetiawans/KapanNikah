import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
import { KEGIATAN } from "../../../Codec/Codec";
import Select from "../../form/Select";
 
export default function KegiatanAddForm() {
	const navigate = useNavigate();
	const [namaKegiatan, setNamaKegiatan] = useState("");
	const [codeKegiatan, setCodeKegiatan] = useState("");
	const handleSubmit = async () => {
		if (confirm("Apakah kamu yakin ingin menambah data kegiatan ini?")) {
	 		if (!namaKegiatan.trim()) {
		       alert("Nama kegiatan wajib diisi");
		       return;
		     }
		    if (!codeKegiatan.toString().trim()) {
		      alert("Kode Kegiatan wajib diisi");
		      return;
		    }
		    try {
				const token = localStorage.getItem("token");

		        await axios.post(
		          `${import.meta.env.VITE_API_URL}/api/kegiatan`,
				  {
				    namaKegiatan: namaKegiatan,   
				    codeKegiatan: codeKegiatan  
				    
				  },
				  {
				    headers: { Authorization: `Bearer ${token}` },
				  }
		        );
		    	alert("Berhasil disimpan");
	        	navigate("/kegiatan");
		    }catch (err) {
		        alert(
		          err.response?.data?.message ||
		          "Gagal simpan"
		        );

		    }

	 	}
	}
	const options = [
		{ value: KEGIATAN.WEDDING, label: "WD - Pernikahan" , selected: false},
	];	
	const handleSelectChange = (value) => {
		console.log("Selected value:", value);
		setCodeKegiatan(value); 
	};	
	return (
	 	<ComponentCard title="Data kegiatan">
	      <div className="space-y-6">
	        <div>
	          <Label htmlFor="namakegiatan">Nama kegiatan</Label>
	          <Input
	            type="text"
	            value={namaKegiatan}
	            onChange={(e) => setNamaKegiatan(e.target.value)}
	            placeholder="Masukan Nama kegiatan"
	          />
	        </div>
	        <div>
	          <Label>Kode Kegiatan</Label>
	          <Select
	            options={options}
	            placeholder="Pilih Kode Kegiatan"
	            onChange={handleSelectChange}
	            className="dark:bg-dark-900"
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
	        <a href="/kegiatan">
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