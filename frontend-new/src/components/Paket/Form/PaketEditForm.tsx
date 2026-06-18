import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 

export default function PaketEditForm() {
	const navigate = useNavigate();
	const { id } = useParams(); 
	const [namaPaket, setNamaPaket] = useState("");
	const [hargaPaket, setHargaPaket] = useState("");
	const [deskripsiPaket, setDeskripsiPaket] = useState("");
	const [hargaDisplay, setHargaDisplay] = useState("");
	const fetchPaketDetail = () => {
	  const getPaketDetail = async () => {
	    try {
	      const token = localStorage.getItem("token");
	      const response = await axios.get(
	        `${import.meta.env.VITE_API_URL}/api/paket/${id}`,
	        { headers: { Authorization: `Bearer ${token}` } }
	      );
	      const paket = response.data;
	      setNamaPaket(paket.nama_paket);
	      setDeskripsiPaket(paket.deskripsi_paket);

	      // ✅ Set hargaPaket dan hargaDisplay langsung di sini
	      const raw = String(paket.harga_paket).replace(/\./g, "");
	      setHargaPaket(raw);
	      setHargaDisplay(Number(raw).toLocaleString("id-ID"));

	    } catch (err) {
	      console.error(err);
	      alert(err.response?.data?.message || "Gagal memuat data paket");
	      navigate("/paket");

	    } finally {
	      setLoading(false);
	    }
	  };
	  getPaketDetail();
	};

	useEffect(() => {
	  if (id) {
	    fetchPaketDetail(); // ✅ hapus handleHarga(hargaPaket) di sini
	  }
	}, [id]);

  	
  	const [loading, setLoading] = useState(true);
	const handleHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
	  const raw = e.target.value.replace(/\./g, "");
	  
	  if (isNaN(Number(raw))) return; 
	  
	  setHargaPaket(raw); 
	  setHargaDisplay(Number(raw).toLocaleString("id-ID"));
	};
	const handleUpdate = async () => {
		if (confirm("Apakah kamu yakin ingin mengubah data paket ini?")) {
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

	        await axios.put(
	          `${import.meta.env.VITE_API_URL}/api/paket/${id}`,
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
	        window.location.reload();
	      } catch (err) {
	        alert(
	          err.response?.data?.message ||
	          "Gagal simpan"
	        );

	      }
	    }
	};
	if (loading) {
	    return (
	      <ComponentCard title="Edit Paket">
	        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
	      </ComponentCard>
		);
	}
	return (
		<ComponentCard title="Edit Data Paket">
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
		          onClick={handleUpdate}
		          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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