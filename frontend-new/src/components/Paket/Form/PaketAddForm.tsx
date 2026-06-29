import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 
import Select from "react-select"; 
import { CODE_TEMPLATE } from "../../../Codec/Codec";

interface FiturOption {
  id: number;
  nama_fitur: string; 
  harga: number;      
}
interface TemplateOption {
  code_template: string;  
  nama_code_template:string     
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

export default function PaketAddForm() {
  const navigate = useNavigate();
  const [namaPaket, setNamaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  const [listFitur, setListFitur] = useState<FiturOption[]>([]);
  const [listTemplate, setListTemplate] = useState<TemplateOption[]>([]);
  const [detailFitur, setDetailFitur] = useState<DetailFiturRow[]>([
    { fitur_id: "", harga_fitur: 0 }
  ]);
  const [detailTemplate, setDetailTemplate] = useState<DetailTemplateRow[]>([
    { code_template: "", nama_template:"" }
  ]);
  const codeOptions = [
    { code_template: CODE_TEMPLATE.TEMPLATE1, nama_code_template: "Template 1"},
    { code_template: CODE_TEMPLATE.TEMPLATE2, nama_code_template: "Template 2"},
    { code_template: CODE_TEMPLATE.TEMPLATE3, nama_code_template: "Template 3"},
  ];  
  
  useEffect(() => {
    const fetchFitur = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur/aktif`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListFitur(res.data); 
      } catch (err) {
        console.error("Gagal memuat list fitur", err);
      }
    };
    fetchFitur();
    setListTemplate(codeOptions);
  }, []);

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
    setDetailTemplate([...detailTemplate, { code_template: "", nama_template:"" }]);
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
      
      updated[index].harga_fitur = res.data.harga || res.data.harga_fitur || 0; 
      setDetailFitur(updated);
    } catch (err) {
      console.error("Gagal memuat detail harga fitur", err);
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
  const handleSubmit = async () => {
    if (confirm("Apakah kamu yakin ingin menambah data paket ini?")) {
      if (!namaPaket.trim()) return alert("Nama paket wajib diisi");
      if (!deskripsiPaket.trim()) return alert("Deskripsi paket wajib diisi");
      
      const validDetail = detailFitur.filter(item => item.fitur_id !== "");
      if (validDetail.length === 0) return alert("Minimal pilih satu detail fitur");

      const validDetailTemplate = detailTemplate.filter(item => item.code_template !== "");
      if (validDetailTemplate.length === 0) return alert("Minimal pilih satu detail template");

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/paket`,
          {
            namaPaket: namaPaket,     
            deskripsiPaket: deskripsiPaket,
            hargaPaket: totalHargaPaket,
            detail_fitur: validDetail.map(item => ({
              fitur_id: Number(item.fitur_id),
              hargaFitur: item.harga_fitur
            })),
            detail_template: validDetailTemplate.map(item => ({
              code_template: item.code_template,
              nama_template: item.nama_template
            }))
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Berhasil disimpan");
        navigate("/paket");
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal simpan");
      }
    }
  };

  return (
    <ComponentCard title="Data Paket">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-700">Detail Fitur Paket</h3>
            <button
              type="button"
              onClick={addRowDetail}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
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
                      placeholder="Cari & Pilih Fitur..."
                      isSearchable={true}
                      isClearable={true}
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
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Simpan Paket
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