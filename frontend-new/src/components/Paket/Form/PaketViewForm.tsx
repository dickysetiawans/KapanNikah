import { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import CKEditorField from "../../Ckeditor/CKEditorField"; 


interface PaketDetail {
  id: number;
  paket_id: number;
  fitur_id: number;
  nama_fitur: string;
  code_fitur: string;
  harga_fitur: number;
}
interface PaketDetailTemplate {
  id: number;
  paket_id: number;
  code_template: string;
}
export default function PaketViewForm() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [namaPaket, setNamaPaket] = useState("");
  const [hargaPaket, setHargaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  const [hargaDisplay, setHargaDisplay] = useState("");
  const [detailFitur, setDetailFitur] = useState<PaketDetail[]>([]);
  const [detailTemplate, setDetailTemplate] = useState<PaketDetailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaketDetail = () => {
    const getPaketDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch Data Paket (Header)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/paket/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const paket = response.data;
        setNamaPaket(paket.nama_paket);
        setDeskripsiPaket(paket.deskripsi_paket);

        const raw = String(paket.harga_paket).replace(/\./g, "");
        setHargaPaket(raw);
        setHargaDisplay(Number(raw).toLocaleString("id-ID"));

        const detailResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-fitur`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetailFitur(detailResponse.data);

        const detailTemplateResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/paket/${id}/detail-template`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDetailTemplate(detailTemplateResponse.data);

      } catch (err: any) {
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
      fetchPaketDetail(); 
    }
  }, [id]);

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
            onChange={() => {}}  
            placeholder="Masukan Nama Paket"
            className="bg-gray-50 cursor-not-allowed dark:bg-gray-800"
          />
        </div>
        <div>
          <Label htmlFor="hargaPaket">Harga Paket (Total)</Label>
          <Input
            type="text"
            readOnly
            value={hargaDisplay}
            onChange={() => {}}  
            placeholder="Masukan Harga Paket"
            namePrefix="Rp"
            prefixOn={true}
            className="bg-gray-50 cursor-not-allowed dark:bg-gray-800 font-bold text-green-600"
          />
        </div>
        <div>
          <Label htmlFor="deskripsiPaket">Deskripsi Paket</Label>
          <CKEditorField 
            value={deskripsiPaket}
            onChange={() => {}} 
            readOnly={true}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Fitur yang Termasuk:</h3>
          
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-3 border-b border-gray-200 w-16">No</th>
                <th className="p-3 border-b border-gray-200">Kode Fitur</th>
                <th className="p-3 border-b border-gray-200">Nama Fitur</th>
                <th className="p-3 border-b border-gray-200 text-right">Harga Satuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm">
              {detailFitur.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                    Tidak ada fitur tambahan pada paket ini.
                  </td>
                </tr>
              ) : (
                detailFitur.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-3 font-mono text-xs text-gray-600">{item.code_fitur}</td>
                    <td className="p-3 font-medium text-gray-800">{item.nama_fitur}</td>
                    <td className="p-3 text-right text-gray-700">
                      Rp {item.harga_fitur.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4">Template yang Termasuk:</h3>
          
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-3 border-b border-gray-200 w-16">No</th>
                <th className="p-3 border-b border-gray-200">Kode Template</th>
                <th className="p-3 border-b border-gray-200">Nama Template</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm">
              {detailTemplate.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 italic">
                    Tidak ada Template tambahan pada paket ini.
                  </td>
                </tr>
              ) : (
                detailTemplate.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="p-3 font-mono text-xs text-gray-600">{item.code_template}</td>
                    <td className="p-3 font-medium text-gray-800">{item.nama_template}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
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