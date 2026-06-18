import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 

export default function PaketAddForm() {
	const navigate = useNavigate();
	const [namaPaket, setNamaPaket] = useState("");
	const [hargaPaket, setHargaPaket] = useState("");
	const [deskripsiPaket, setDeskripsiPaket] = useState("");
	const [hargaDisplay, setHargaDisplay] = useState("");

  	const handleSubmit = async () => {
	    if (confirm("Apakah kamu yakin ingin menambah data paket ini?")) {
	      if (!namaPaket.trim()) {
	        alert("Nama paket wajib diisi");
	        return;
	      }
	      if (!hargaPaket.toString().trim()) {
	        alert("Harga paket wajib diisi");
	        return;
	      }
	      if (!deskripsiPaket.trim()) {
	        alert("Deskripsi paket wajib diisi");
	        return;
	      }

	       try {

	        const token = localStorage.getItem("token");

	        await axios.post(
	          `${import.meta.env.VITE_API_URL}/api/paket`,
			  {
			    namaPaket: namaPaket,     
			    hargaPaket: Number(hargaPaket),
			    deskripsiPaket: deskripsiPaket,
			  },
			  {
			    headers: { Authorization: `Bearer ${token}` },
			  }
	        );

	        alert("Berhasil disimpan");
	        navigate("/paket");
	      } catch (err) {
	        alert(
	          err.response?.data?.message ||
	          "Gagal simpan"
	        );

	      }
	    }
  	};
  	const handleHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const raw = e.target.value.replace(/\./g, "");
	  
	  if (isNaN(Number(raw))) return; 
	  
	  setHargaPaket(raw); 
	  setHargaDisplay(Number(raw).toLocaleString("id-ID"));
	};

  return (
    <ComponentCard title="Data Paket">
      <div className="space-y-6">
        <div>
          <Label htmlFor="namaPaket">Nama Paket</Label>
          <Input
            type="text"
            value={namaPaket}
            onChange={(e) => setNamaPaket(e.target.value)}
            placeholder="Masukan Nama Paket"
          />
        </div>
        <div>
          <Label htmlFor="hargaPaket">Harga Paket</Label>
          <Input
				type="text"         
				value={hargaDisplay}
				onChange={handleHarga}
				placeholder="Masukan Harga Paket"
				namePrefix="Rp"
				prefixOn={true}
			/>
         	
        </div>
        <div>
          <Label htmlFor="deskripsiPaket">Deskripsi Paket</Label>
          <CKEditorField  // ✅ ganti bagian ini
            value={deskripsiPaket}
            onChange={(val) => setDeskripsiPaket(val)}
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
        <a href="/paket">
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