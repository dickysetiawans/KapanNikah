import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
export default function PaketViewForm() {
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
	
	if (loading) {
	    return (
	      <ComponentCard title="Detail Paket">
	        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
	      </ComponentCard>
		);
	}
	return (
		<ComponentCard title="Detail Data Paket">
			<div className="space-y-6">
		        <div>
		          	<Label htmlFor="namaPaket">Nama Paket</Label>
		         	<Input
					  type="text"
					  readOnly
					  value={namaPaket}
					  onChange={() => {}}  // ✅ tambah ini
					  placeholder="Masukan Nama Paket"
					  className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
					/>
		        </div>
		        <div>
		          	<Label htmlFor="hargaPaket">Harga Paket</Label>
		          	<Input
					  type="text"
					  readOnly
					  value={hargaDisplay}
					  onChange={() => {}}  // ✅ tambah ini
					  placeholder="Masukan Harga Paket"
					  namePrefix="Rp"
					  prefixOn={true}
					  className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
					/>
				</div>
		        <div>
		          <Label htmlFor="deskripsiPaket">Deskripsi Paket</Label>
		          <CKEditorField  // ✅ ganti bagian ini
		            value={deskripsiPaket}
		            onChange={() => {}} 
		            readOnly={true}
		          />
		        </div>
		      </div>
		    <div className="mt-6 flex gap-2">
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