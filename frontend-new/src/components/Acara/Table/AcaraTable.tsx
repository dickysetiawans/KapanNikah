import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { CheckLineIcon, CloseLineIcon } from "../../../icons"; // Sesuaikan path icon TailAdmin Anda
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Acara {
  id: number;
  kegiatan_id: number;
  paket_id: number;
  jumlah_tamu: number;
  nama_acara: string;
  nama_kegiatan: string; 
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export default function AcaraTable() {
  const navigate = useNavigate();
  const [acaras, setAcaras] = useState<Acara[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleView = (id: number) => {
    navigate(`/acara/view/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/acara/edit/${id}`);
  };

  const getAcaras = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/acara`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAcaras(response.data);
    } catch (error) {
      console.error("Gagal memuat data acara:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAcaras();
  }, []);

 
  const filteredAcaras = (acaras || []).filter((acara) => {
    const searchLower = searchTerm.toLowerCase();
    
    const namaMatches = acara.nama_acara?.toLowerCase().includes(searchLower);
    const tamuMatches = acara.jumlah_tamu?.toString().includes(searchLower);
    const tglMulaiStr = acara.tanggal_mulai ? new Date(acara.tanggal_mulai).toLocaleDateString("id-ID").includes(searchLower) : false;

    return namaMatches || tamuMatches || tglMulaiStr;
  });

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAcaras.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAcaras.length / itemsPerPage) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  
  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex justify-left">
        <input
          type="text"
          placeholder="Cari nama acara, atau jumlah tamu..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-center text-sm text-gray-500">Memuat data acara...</p>
        ) : filteredAcaras.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">Tidak Ada Data Acara</p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nama Acara
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Kegiatan
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Jumlah Tamu
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Waktu Mulai
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Waktu Selesai
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-center text-theme-xs">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((acara) => (
                  <TableRow key={acara.id}>
                    <td className="px-5 py-4 text-gray-800 font-medium text-start text-theme-sm">
                      {acara.nama_acara}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-start text-theme-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {acara.nama_kegiatan || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-start text-theme-sm">
                      {acara.jumlah_tamu.toLocaleString("id-ID")} Orang
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-start text-theme-sm font-mono text-xs">
                      {formatTanggal(acara.tanggal_mulai)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-start text-theme-sm font-mono text-xs">
                      {formatTanggal(acara.tanggal_selesai)}
                    </td>
                    <td className="px-5 py-4 text-center text-theme-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(acara.id)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(acara.id)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition"
                        >
                          Ubah
                        </button>
                      </div>
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Bagian Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl">
        <span className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{filteredAcaras.length === 0 ? 0 : indexOfFirstItem + 1}</span> sampai{" "}
          <span className="font-medium">
            {indexOfLastItem > filteredAcaras.length ? filteredAcaras.length : indexOfLastItem}
          </span>{" "}
          dari <span className="font-medium">{filteredAcaras.length}</span> data
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}