import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

export default function CustomerEditForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);
  // 1. Ambil data lama untuk di-isi ke Form (Pre-fill)
  const fetchCustomerDetail = () => {
    const getCustomerDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/customers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const customer = response.data;
        setName(customer.name);
        setEmail(customer.email);
        setPhone(customer.phone || "");
        setIsActive(customer.is_active);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data pelanggan");
        navigate("/pelanggan");
      } finally {
        setLoading(false);
      }
    };
    getCustomerDetail();
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetail();
    }
  }, [id]);

  // 2. Fungsi untuk menyimpan perubahan data (Submit)
	const handleUpdate = async () => {
	  if (confirm("Apakah kamu yakin ingin mengubah pelanggan ini?")) {
		if (!name.trim()) {
	      alert("Nama pelanggan wajib diisi");
	      return;
	    }

	    if (!email.trim()) {
	      alert("Email wajib diisi");
	      return;
	    }else{
	    	const dataemail = validateEmail(email);
	    	if(!dataemail){
				alert("Alamat email tidak valid..");
	     		return;
	    	}
	    	
	    }
	    if (!phone.trim()) {
	      alert("Nomor handphone wajib diisi");
	      return;
	    }
	    try {
	      const token = localStorage.getItem("token");
	      await axios.put(
	        `${import.meta.env.VITE_API_URL}/api/customers/${id}`,
	        {
	          name,
	          phone,
	          email,
	          is_active: isActive,
	        },
	        {
	          headers: {
	            Authorization: `Bearer ${token}`,
	          },
	        }
	      );

	      alert("Data pelanggan berhasil diperbarui!");
	      navigate("/pelanggan"); // Kembali ke list tabel
	    } catch (err: any) {
	      alert(err.response?.data?.message || "Gagal memperbarui data");
	    }
	  }
	     
	};
	const validateEmail = (value: string) => {
	    const isValidEmail =
	      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
	    setError(!isValidEmail);
	    return isValidEmail;
	  };

	  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	    const value = e.target.value;
	    setEmail(value);
	    validateEmail(value);
	  };
  if (loading) {
    return (
      <ComponentCard title="Edit Pelanggan">
        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Data Pelanggan">
      <div className="space-y-6 mb-6">
        {/* Nama Pelanggan */}
        <div>
          <Label htmlFor="name">Nama Pelanggan</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} // 👈 Ditambahkan agar bisa diketik
            placeholder="Masukan Nama Pelanggan"

          />
        </div>

       
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange} 
            error={error}
            className="bg-gray-100 dark:bg-gray-800"
            hint={error ? "Alamat email tidak valid.." : ""}
          />
        </div>

        {/* Nomor Handphone */}
        <div>
          <Label htmlFor="phone">Nomor Handphone</Label>
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)} // 👈 Ditambahkan agar bisa diketik
            placeholder="Masukan Nomor Handphone"
          />
        </div>

        {/* Status Aktif */}
        <div>
          <Switch
            key={isActive ? "active" : "inactive"} // 👈 Memaksa Switch render ulang sesuai status data database
            label="Aktif"
            defaultChecked={isActive}
            onChange={(checked) => {
              setIsActive(checked);
            }}// 👈 Menangkap perubahan toggle switch
          />

        </div>
      </div>

      <div className="flex gap-2">
        {/* Tombol Simpan Perubahan */}
        <button
          type="button"
          onClick={handleUpdate}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Simpan
        </button>

        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={() => navigate("/pelanggan")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}