import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
import Select from "react-select"; 
import { CODE_TEMPLATE } from "../../../Codec/Codec";

interface FiturOption {
  id: number;
  nama_fitur: string; 
  harga_fitur: number;      
  kegiatan_id: number;
  code_fitur: string;
  is_active: boolean;
}

interface TemplateOption {
  code_template: string;  
  nama_code_template: string;     
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOptionTemplate {
  value: string;
  label: string;
}

interface DetailFiturRow {
  fitur_id: string;
  harga_fitur: number;
}

interface DetailTemplateRow {
  id?: number; // Menyimpan ID primary key bawaan database (untuk data lama)
  code_template: string;
  nama_template: string;
}

export default function PaketEditForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [namaPaket, setNamaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  
  // --- States Dropdown Kegiatan Utama ---
  const [listKegiatan, setListKegiatan] = useState<SelectOption[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<SelectOption | null>(null);

  // --- States Master Data Lainnya ---
  const [listFitur, setListFitur] = useState<FiturOption[]>([]); // Diisi dinamis via AJAX
  const [listTemplate, setListTemplate] = useState<TemplateOption[]>([]);
  
  const [detailFitur, setDetailFitur] = useState<DetailFiturRow[]>([]);
  const [detailTemplate, setDetailTemplate] = useState<DetailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const codeOptions = [
    { code_template: CODE_TEMPLATE.TEMPLATE1, nama_code_template: "Template 1"},
    { code_template: CODE_TEMPLATE.TEMPLATE2, nama_code_template: "Template 2"},
    { code_template: CODE_TEMPLATE.TEMPLATE3, nama_code_template: "Template 3"},
  ];  

  // 1. Inisialisasi Data Master Kegiatan dan Data Paket Lama
  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Ambil list Kegiatan
        const resKegiatan = await axios.get(`${import.meta.env.VITE_API_URL}/api/kegiatan`, { headers });
        const mappedKegiatan: SelectOption[] = resKegiatan.data.map((k: any) => ({
          value: String(k.ID || k.id),
          label: k.nama_kegiatan
        }));
        setListKegiatan(mappedKegiatan);
        setListTemplate(codeOptions);

        if (id) {
          // Ambil data Paket Utama
          const resPaket = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/${id}`, { headers });
          setNamaPaket(resPaket.data.nama_paket);
          setDeskripsiPaket(resPaket.data.deskripsi_paket);

          // Pasang Kegiatan ter-pilih lama
          const kegId = resPaket.data.kegiatan_id || resPaket.data.KegiatanId;
          const foundKegiatan = mappedKegiatan.find(opt => Number(opt.value) === Number(kegId));
          if (foundKegiatan) {
            setSelectedKegiatan(foundKegiatan);
          }

          // Ambil data detail fitur paket lama
          const resDetailFitur = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-fitur`, { headers });
          if (resDetailFitur.data && resDetailFitur.data.length > 0) {
            setDetailFitur(resDetailFitur.data.map((item: any) => ({
              fitur_id: String(item.fitur_id),
              harga_fitur: item.harga_fitur,
            })));
          } else {
            setDetailFitur([{ fitur_id: "", harga_fitur: 0 }]);
          }

          // Ambil data detail template paket lama
          const resDetailTemplate = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-template`, { headers });
          if (resDetailTemplate.data && resDetailTemplate.data.length > 0) {
            setDetailTemplate(resDetailTemplate.data.map((item: any) => ({
              id: item.id, // ID bawaan DB diselamatkan agar transaksi UPDATE berjalan, bukan INSERT baru
              code_template: item.code_template,
              nama_template: item.nama_template,
            })));
          } else {
            setDetailTemplate([{ code_template: "", nama_template: "" }]);
          }
        }
      } catch (err: any) {
        console.error(err);
        alert("Gagal memuat data paket");
        navigate("/paket");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, navigate]);

  // 2. FUNGSI AJAX: Ambil data fitur spesifik ketika Kegiatan Utama diubah
  useEffect(() => {
    const fetchFiturByKegiatan = async () => {
      if (!selectedKegiatan) {
        setListFitur([]);
        if (!isFirstLoad) setDetailFitur([{ fitur_id: "", harga_fitur: 0 }]);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const kegiatanId = selectedKegiatan.value;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur/kegiatan/${kegiatanId}`, { headers });
        
        if (!res.data || res.data.length === 0) {
          alert("Tidak ada fitur aktif yang tersedia untuk kegiatan ini.");
          setListFitur([]);
        } else {
          setListFitur(res.data);
        }
        
        // Reset baris input tabel fitur HANYA jika ini bukan proses pembukaan halaman pertama kali (saat user mengubah isi manual)
        if (!isFirstLoad) {
          setDetailFitur([{ fitur_id: "", harga_fitur: 0 }]);
        } else {
          setIsFirstLoad(false);
        }
      } catch (err) {
        console.error("Gagal mengambil data fitur via AJAX:", err);
      }
    };

    if (!loading) {
      fetchFiturByKegiatan();
    }
  }, [selectedKegiatan, loading]);

  const dropdownOptions: SelectOption[] = listFitur.map((f) => ({
    value: String(f.id),
    label: f.nama_fitur,
  }));

  const dropdownTemplateOptions: SelectOptionTemplate[] = listTemplate.map((f) => ({
    value: String(f.code_template),
    label: f.nama_code_template,
  }));

  const totalHargaPaket = detailFitur.reduce((sum, item) => sum + item.harga_fitur, 0);

  const addRowDetail = () => {
    setDetailFitur([...detailFitur, { fitur_id: "", harga_fitur: 0 }]);
  };

  const removeRowDetail = (index: number) => {
    const updated = [...detailFitur];
    updated.splice(index, 1);
    setDetailFitur(updated);
  };

  const addRowTemplateDetail = () => {
    setDetailTemplate([...detailTemplate, { code_template: "", nama_template: "" }]);
  };

  const removeRowTemplateDetail = (index: number) => {
    const updated = [...detailTemplate];
    updated.splice(index, 1);
    setDetailTemplate(updated);
  };

  const handleFiturChange = async (index: number, selectedOption: SelectOption | null) => {
    const updated = [...detailFitur];
    
    if (!selectedOption) {
      updated[index].fitur_id = "";
      updated[index].harga_fitur = 0;
      setDetailFitur(updated);
      return;
    }

    const fiturId = selectedOption.value;
    const isDuplicate = detailFitur.some((row, i) => i !== index && row.fitur_id === fiturId);
    if (isDuplicate) {
      alert("Fitur ini sudah dipilih di baris lain. Silakan pilih fitur yang berbeda.");
      return; 
    }

    updated[index].fitur_id = fiturId;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur/${fiturId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      updated[index].harga_fitur = res.data.harga_fitur || 0; 
      setDetailFitur(updated);
    } catch (err) {
      console.error("Gagal memuat detail harga fitur:", err);
    }
  };

  const handleTemplateChange = async (index: number, selectedOption: SelectOptionTemplate | null) => {
    const updated = [...detailTemplate];
    
    if (!selectedOption) {
      updated[index].code_template = "";
      updated[index].nama_template = "";
      setDetailTemplate(updated);
      return;
    }

    const codeTemplate = selectedOption.value;
    const namaTemplate = selectedOption.label;

    const isDuplicate = detailTemplate.some((row, i) => i !== index && row.code_template === codeTemplate);
    if (isDuplicate) {
      alert("Template ini sudah dipilih di baris lain. Silakan pilih Template yang berbeda.");
      return; 
    }

    updated[index].code_template = codeTemplate;
    updated[index].nama_template = namaTemplate;
    setDetailTemplate(updated);
  };

  const handleUpdate = async () => {
    if (confirm("Apakah kamu yakin ingin mengubah data paket ini?")) {
      if (!selectedKegiatan) return alert("Silakan pilih Kegiatan terlebih dahulu");
      if (!namaPaket.trim()) return alert("Nama paket wajib diisi");
      if (!deskripsiPaket.trim()) return alert("Deskripsi paket wajib diisi");
      
      const validDetail = detailFitur.filter(item => item.fitur_id !== "");
      if (validDetail.length === 0) return alert("Minimal pilih satu detail fitur");

      const validDetailTemplate = detailTemplate.filter(item => item.code_template !== "");
      if (validDetailTemplate.length === 0) return alert("Minimal pilih satu detail template");

      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/paket/${id}`,
          {
            kegiatan_id: Number(selectedKegiatan.value), // Kirim kunci kegiatanId ke backend Go Anda
            namaPaket: namaPaket,     
            deskripsiPaket: deskripsiPaket,
            hargaPaket: totalHargaPaket,
            detail_fitur: validDetail.map(item => ({
              fitur_id: Number(item.fitur_id),
              hargaFitur: item.harga_fitur
            })),
            detail_template: validDetailTemplate.map(item => ({
              id: item.id ? Number(item.id) : 0, // Mengirim primary key id data template lama (0 jika baris baru ditambah saat edit)
              code_template: item.code_template,
              nama_template: item.nama_template
            }))
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Berhasil diperbarui");
        navigate("/paket");
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal perbarui data");
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
        
        {/* Input Dropdown Kegiatan Utama */}
        <div style={{ overflow: "visible" }}>
          <Label htmlFor="kegiatan">Kegiatan Utama Paket</Label>
          <Select
            options={listKegiatan}
            placeholder="Pilih Kegiatan Terlebih Dahulu..."
            isSearchable={true}
            isClearable={true}
            value={selectedKegiatan}
            onChange={(selected) => setSelectedKegiatan(selected)}
            className="text-sm"
          />
        </div>

        {/* Input Nama & Output Harga Paket */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="namaPaket">Nama Paket</Label>
            <Input
              type="text"
              value={namaPaket}
              onChange={(e) => setNamaPaket(e.target.value)}
              placeholder="Masukkan Nama Paket"
              disabled={!selectedKegiatan} 
            />
          </div>
          <div>
            <Label htmlFor="hargaPaket">Total Harga Paket (Auto dari Detail)</Label>
            <div className="p-2 bg-gray-100 rounded-lg font-bold text-lg text-green-700 border border-gray-300">
              Rp {totalHargaPaket.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="deskripsiPaket">Deskripsi Paket</Label>
          <CKEditorField 
            value={deskripsiPaket}
            onChange={(val) => setDeskripsiPaket(val)}
          />
        </div>

        {/* --- Bagian Tabel Detail Fitur --- */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-700">Detail Fitur Paket</h3>
            <button
              type="button"
              disabled={!selectedKegiatan}
              onClick={addRowDetail}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40"
            >
              + Tambah Fitur
            </button>
          </div>

          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-3 border-b border-gray-200">Fitur</th>
                <th className="p-3 border-b border-gray-200">Harga Fitur</th>
                <th className="p-3 border-b border-gray-200 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {detailFitur.map((row, index) => (
                <tr key={index}>
                  <td className="p-3" style={{ overflow: "visible" }}>
                    <Select
                      options={dropdownOptions} 
                      placeholder={selectedKegiatan ? "Cari & Pilih Fitur..." : "Silakan pilih kegiatan utama di atas"}
                      isSearchable={true}
                      isClearable={true}
                      isDisabled={!selectedKegiatan}
                      value={dropdownOptions.find(opt => opt.value === row.fitur_id) || null}
                      onChange={(selected) => handleFiturChange(index, selected)}
                      className="text-sm"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-700">
                    Rp {row.harga_fitur.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      disabled={detailFitur.length === 1}
                      onClick={() => removeRowDetail(index)}
                      className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       
        {/* --- Bagian Tabel Detail Template --- */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-700">Detail Template Paket</h3>
            <button
              type="button"
              onClick={addRowTemplateDetail}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              + Tambah Template
            </button>
          </div>

          <table className="w-full border-collapse border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-3 border-b border-gray-200">Template</th>
                <th className="p-3 border-b border-gray-200 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {detailTemplate.map((row, index) => (
                <tr key={index}>
                  <td className="p-3" style={{ overflow: "visible" }}>
                    <Select
                      options={dropdownTemplateOptions}
                      placeholder="Cari & Pilih Template..."
                      isSearchable={true}
                      isClearable={true}
                      value={dropdownTemplateOptions.find(opt => opt.value === row.code_template) || null}
                      onChange={(selected) => handleTemplateChange(index, selected)}
                      className="text-sm"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      disabled={detailTemplate.length === 1}
                      onClick={() => removeRowTemplateDetail(index)}
                      className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={handleUpdate}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Simpan Perubahan
        </button>
        <button
          type="button"
          onClick={() => navigate("/paket")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}