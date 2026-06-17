import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import { EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import DatePicker from "../../form/date-picker.tsx";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate } from "react-router";

export default function PaketAddForm() {
	const [namaPaket, setNamaPaket] = useState("");
  	const [hargaPaket, setHargaPaket] = useState(0);
  	const [deskripsiPaket, setDeskripsiPaket] = useState("");
  	const handleSubmit = async () => {
  		if (confirm("Apakah kamu yakin ingin menambah data paket ini?")) {
	      if (!namaPaket.trim()) {
	        alert("Nama paket wajib diisi");
	        return;
	      }

	      if (!hargaPaket.trim()) {
	        alert("Harga paket wajib diisi");
	        return;
	      }

	      if (!deskripsiPaket.trim()) {
	        alert("Deskripsi paket wajib diisi");
	        return;
	      }
  		}
  	};
  	return (
		<ComponentCard title="Data Paket"> 
	  		<div className="space-y-6">
	  			<div>
		          <Label htmlFor="input">Nama Paket</Label>
		          <Input
		            type="text"
		            value={namaPaket}
		            onChange={(e) =>
		              setNamaPaket(e.target.value)
		            }
		            placeholder="Masukan Nama Paket"

		          />
		        </div>
				<div>
		          <Label htmlFor="input">Harga Paket</Label>
		          <Input
		            type="number"
		            value={hargaPaket}
		            onChange={(e) =>
		              setNamaPaket(e.target.value)
		            }
		            placeholder="Masukan Harga Paket"

		          />
		        </div>
				<div>
		          <Label htmlFor="input">Deskripsi Paket</Label>
		          <Input
		            type="text"
		            value={deskripsiPaket}
		            onChange={(e) =>
		              setNamaPaket(e.target.value)
		            }
		            placeholder="Masukan Deskripsi Paket"

		          />
		        </div>
	  		</div>
	  		<button
		        type="button"
		        onClick={handleSubmit}
		        className="
		          px-4
		          py-2
		          bg-green-600
		          text-white
		          rounded-lg
		        "
		        style={{
		        marginRight: "5px",

		        }}
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
	 	</ComponentCard>
  	);
 	
}