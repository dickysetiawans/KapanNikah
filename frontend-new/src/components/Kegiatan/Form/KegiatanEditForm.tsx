import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { KEGIATAN } from "../../../Codec/Codec";
import Select from "../../form/Select";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function KegiatanEditForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [codeKegiatan, setCodeKegiatan] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchkegiatanDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/kegiatan/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Pastikan response.data sesuai dengan nama field dari backend Anda
      const kegiatan = response.data;
      setNamaKegiatan(kegiatan.nama_kegiatan || kegiatan.NamaKegiatan || "");
      setCodeKegiatan(kegiatan.code_kegiatan || kegiatan.CodeKegiatan || "");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal memuat data kegiatan");
      navigate("/kegiatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchkegiatanDetail();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (confirm("Apakah kamu yakin ingin mengubah data kegiatan ini?")) {
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

        // Menambahkan ID ke URL endpoint atau sesuaikan dengan route backend Anda
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/kegiatan/${id}`,
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
      } catch (err) {
        alert(err.response?.data?.message || "Gagal simpan");
      }
    }
  };

  const options = [
    { value: KEGIATAN.WEDDING, label: "WD - Pernikahan" },
  ];  

  const handleSelectChange = (value) => {
    console.log("Selected value:", value);
    setCodeKegiatan(value); 
  };  

  if (loading) {
    return (
      <ComponentCard title="Edit Kegiatan">
        <p className="p-5 text-center text-sm text-gray-500">Memuat data...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Edit Data kegiatan">
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
            defaultValue={codeKegiatan} 
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
        <button
          type="button"
          onClick={() => navigate("/kegiatan")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}