import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

export default function CustomerViewForm() {
  const navigate = useNavigate();
  // 1. Ambil id dari parameter URL router (misal: /pelanggan/view/:id)
  const { id } = useParams(); 

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  // 2. Fungsi untuk mengambil data detail dari backend
  const fetchCustomerDetail = sqlGet => {
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

        // Isi state dengan data dari backend
        const customer = response.data;
        setName(customer.name);
        setEmail(customer.email);
        setPhone(customer.phone || "");
        setIsActive(customer.is_active);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data pelanggan");
        navigate("/pelanggan"); // Kembalikan ke list jika error
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

  if (loading) {
    return (
      <ComponentCard title="Detail Pelanggan">
        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Detail Data Pelanggan">
      <div className="space-y-6 mb-6">
        {/* Nama Pelanggan */}
        <div>
          <Label htmlFor="name">Nama Pelanggan</Label>
          <Input
            type="text"
            value={name}
            readOnly 
            className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            value={email}
            readOnly 
            className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
          />
        </div>

        {/* Nomor Handphone */}
        <div>
          <Label htmlFor="phone">Nomor Handphone</Label>
          <Input
            type="text"
            value={phone}
            readOnly 
            className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
            placeholder="-"
          />
        </div>

        {/* Status Aktif */}
        <div>
          <Switch
            label="Aktif"
            defaultChecked={isActive} 
           
            disabled={true} 
          />
        </div>
      </div>

      {/* Tombol Kembali */}
      <button
        type="button"
        onClick={() => navigate("/pelanggan")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kembali
      </button>
    </ComponentCard>
  );
}