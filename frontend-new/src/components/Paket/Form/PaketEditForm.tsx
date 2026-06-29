import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
import Select from "react-select"; 
import { CODE_TEMPLATE } from "../../../Codec/Codec"; // Import Codec

// --- Interfaces ---
interface FiturOption {
  id: number;
  nama_fitur: string; 
  harga: number;      
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
  code_template: string;
  nama_template: string;
}

export default function PaketEditForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [namaPaket, setNamaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  const [listFitur, setListFitur] = useState<FiturOption[]>([]);
  const [listTemplate, setListTemplate] = useState<TemplateOption[]>([]);
  
  const [detailFitur, setDetailFitur] = useState<DetailFiturRow[]>([]);
  const [detailTemplate, setDetailTemplate] = useState<DetailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const codeOptions = [
    { code_template: CODE_TEMPLATE.TEMPLATE1, nama_code_template: "Template 1"},
    { code_template: CODE_TEMPLATE.TEMPLATE2, nama_code_template: "Template 2"},
    { code_template: CODE_TEMPLATE.TEMPLATE3, nama_code_template: "Template 3"},
  ];  

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Load Master Data (Fitur & Template)
        const resFitur = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur/aktif`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListFitur(resFitur.data);
        setListTemplate(codeOptions);

        if (id) {
          // 2. Load Header Paket
          const resPaket = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/paket/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNamaPaket(resPaket.data.nama_paket);
          setDeskripsiPaket(resPaket.data.deskripsi_paket);

          // 3. Load Detail Fitur
          const resDetailFitur = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-fitur`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (resDetailFitur.data && resDetailFitur.data.length > 0) {
            setDetailFitur(resDetailFitur.data.map((item: any) => ({
              fitur_id: String(item.fitur_id),
              harga_fitur: item.harga_fitur,
            })));
          } else {
            setDetailFitur([{ fitur_id: "", harga_fitur: 0 }]);
          }

          // 4. Load Detail Template
          const resDetailTemplate = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-template`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (resDetailTemplate.data && resDetailTemplate.data.length > 0) {
            setDetailTemplate(resDetailTemplate.data.map((item: any) => ({
              code_template: item.code_template,
              nama_template: item.nama_template,
            })));
          } else {
            setDetailTemplate([{ code_template: "", nama_template: "" }]);
          }
        }
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memuat data paket");
        navigate("/paket");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, navigate]);

  // --- Dropdown Options ---
  const dropdownOptions: SelectOption[] = listFitur.map((f) => ({
    value: String(f.id),
    label: f.nama_fitur,
  }));
  
  const dropdownTemplateOptions: SelectOptionTemplate[] = listTemplate.map((f) => ({
    value: String(f.code_template),
    label: f.nama_code_template,
  }));

  const totalHargaPaket = detailFitur.reduce((sum, item) => sum + item.harga_fitur, 0);

  // --- Handlers Fitur ---
  const addRowDetail = () => setDetailFitur([...detailFitur, { fitur_id: "", harga_fitur: 0 }]);
  const removeRowDetail = (index: number) => {
    const updated = [...detailFitur];
    updated.splice(index, 1);
    setDetailFitur(updated);
  };

  const handleFiturChange = async (index: number, selectedOption: SelectOption | null) => {
    const updated = [...detailFitur];
    if (!selectedOption) {
      updated[index] = { fitur_id: "", harga_fitur: 0 };
      setDetailFitur(updated);
      return;
    }
    const fiturId = selectedOption.value;
    if (detailFitur.some((row, i) => i !== index && row.fitur_id === fiturId)) {
      alert("Fitur ini sudah dipilih.");
      return;
    }
    updated[index].fitur_id = fiturId;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur/${fiturId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updated[index].harga_fitur = res.data.harga || res.data.harga_fitur || 0; 
      setDetailFitur(updated);
    } catch (err) { console.error(err); }
  };

  // --- Handlers Template ---
  const addRowTemplateDetail = () => setDetailTemplate([...detailTemplate, { code_template: "", nama_template: "" }]);
  const removeRowTemplateDetail = (index: number) => {
    const updated = [...detailTemplate];
    updated.splice(index, 1);
    setDetailTemplate(updated);
  };

  const handleTemplateChange = (index: number, selectedOption: SelectOptionTemplate | null) => {
    const updated = [...detailTemplate];
    if (!selectedOption) {
      updated[index] = { code_template: "", nama_template: "" };
      setDetailTemplate(updated);
      return;
    }
    const code = selectedOption.value;
    if (detailTemplate.some((row, i) => i !== index && row.code_template === code)) {
      alert("Template ini sudah dipilih.");
      return;
    }
    updated[index].code_template = code;
    updated[index].nama_template = selectedOption.label;
    setDetailTemplate(updated);
  };

  // --- Submit ---
  const handleUpdate = async () => {
    if (confirm("Apakah kamu yakin ingin mengubah data paket ini?")) {
      if (!namaPaket.trim()) return alert("Nama paket wajib diisi");
      
      const validDetail = detailFitur.filter(item => item.fitur_id !== "");
      if (validDetail.length === 0) return alert("Minimal pilih satu fitur");

      const validDetailTemplate = detailTemplate.filter(item => item.code_template !== "");
      if (validDetailTemplate.length === 0) return alert("Minimal pilih satu template");

      try {
        const token = localStorage.getItem("token");
        await axios.put(`${import.meta.env.VITE_API_URL}/api/paket/${id}`, {
          namaPaket,
          deskripsiPaket,
          hargaPaket: totalHargaPaket,
          detail_fitur: validDetail.map(item => ({
            fitur_id: Number(item.fitur_id),
            hargaFitur: item.harga_fitur
          })),
          detail_template: validDetailTemplate.map(item => ({
            code_template: item.code_template,
            nama_template: item.nama_template 
          }))
        }, { headers: { Authorization: `Bearer ${token}` } });

        alert("Berhasil diperbarui");
        navigate("/paket");
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal perbarui");
      }
    }
  };

  if (loading) return <ComponentCard title="Edit Paket"><p className="p-5 text-center">Memuat...</p></ComponentCard>;

  return (
    <ComponentCard title="Edit Data Paket">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nama Paket</Label>
            <Input type="text" value={namaPaket} onChange={(e) => setNamaPaket(e.target.value)} />
          </div>
          <div>
            <Label>Total Harga Paket</Label>
            <div className="p-2 bg-gray-100 rounded-lg font-bold text-green-700 border">
              Rp {totalHargaPaket.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div>
          <Label>Deskripsi Paket</Label>
          <CKEditorField value={deskripsiPaket} onChange={(val) => setDeskripsiPaket(val)} />
        </div>

        {/* Tabel Fitur */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Detail Fitur Paket</h3>
            <button type="button" onClick={addRowDetail} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">+ Fitur</button>
          </div>
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs uppercase font-semibold">Fitur</th>
                <th className="p-3 text-left text-xs uppercase font-semibold">Harga</th>
                <th className="p-3 text-center text-xs uppercase font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {detailFitur.map((row, index) => (
                <tr key={index}>
                  <td className="p-3">
                    <Select
                      options={dropdownOptions}
                      value={dropdownOptions.find(opt => opt.value === row.fitur_id) || null}
                      onChange={(selected) => handleFiturChange(index, selected)}
                      isClearable
                    />
                  </td>
                  <td className="p-3">Rp {row.harga_fitur.toLocaleString("id-ID")}</td>
                  <td className="p-3 text-center">
                    <button type="button" disabled={detailFitur.length === 1} onClick={() => removeRowDetail(index)} className="text-red-600 disabled:opacity-30">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Template */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Detail Template Paket</h3>
            <button type="button" onClick={addRowTemplateDetail} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">+ Template</button>
          </div>
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs uppercase font-semibold">Template</th>
                <th className="p-3 text-center text-xs uppercase font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {detailTemplate.map((row, index) => (
                <tr key={index}>
                  <td className="p-3">
                    <Select
                      options={dropdownTemplateOptions}
                      value={dropdownTemplateOptions.find(opt => opt.value === row.code_template) || null}
                      onChange={(selected) => handleTemplateChange(index, selected)}
                      isClearable
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button type="button" disabled={detailTemplate.length === 1} onClick={() => removeRowTemplateDetail(index)} className="text-red-600 disabled:opacity-30">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <button type="button" onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg">Simpan Perubahan</button>
        <button type="button" onClick={() => navigate("/paket")} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Kembali</button>
      </div>
    </ComponentCard>
  );
}