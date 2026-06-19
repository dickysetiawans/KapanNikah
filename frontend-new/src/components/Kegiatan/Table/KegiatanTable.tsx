import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

// 1. Perbaiki tipe data interface (Gunakan number, sesuaikan dengan properti dari API)
interface Kegiatans {
  ID: number;
  nama_kegiatan: string;
  code_kegiatan: number;
  
}

export default function KegiatanTable() {
  const navigate = useNavigate();
  const [Kegiatans, setKegiatans] = useState<Kegiatans[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi Aksi Dummy (Silakan sesuaikan dengan logika Anda)
  const handleView = (id: number) => {
    navigate(`/kegiatan/view/${id}`);
  
  };
  const handleEdit = (id: number) => {
    navigate(`/kegiatan/edit/${id}`);
  
  };
  

  const getKegiatans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/kegiatan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKegiatans(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKegiatans();
  }, []);

  // 2. Perbaiki fungsi filter di bawah ini 👇
  const filteredKegiatans = Kegiatans.filter((Kegiatan) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Pastikan properti sesuai snake_case dan ubah Code (number) ke string
    const namaMatches = Kegiatan.nama_kegiatan?.toLowerCase().includes(searchLower);
    const codeMatches = Kegiatan.code_kegiatan?.toString().includes(searchLower);

    return namaMatches || codeMatches;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKegiatans.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredKegiatans.length / itemsPerPage) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };
 

  return (
    <div className="space-y-4">
      <div className="flex justify-left">
        <input
          type="text"
          placeholder="Cari nama Kegiatan, atau Code Kegiatan..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-center text-sm text-gray-500">Loading...</p>
        ) : filteredKegiatans.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">Tidak Ada Kegiatan</p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nama Kegiatan
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    code Kegiatan
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-center text-theme-xs">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((Kegiatan) => (
                  <TableRow key={Kegiatan.ID}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {Kegiatan.nama_kegiatan}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {/* Format ke rupiah atau lokal biar rapi */}
                      Rp {Kegiatan.code_kegiatan.toLocaleString("id-ID")}
                    </TableCell>
                    
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(Kegiatan.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(Kegiatan.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition"
                        >
                          Ubah
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl">
        <span className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{filteredKegiatans.length === 0 ? 0 : indexOfFirstItem + 1}</span> sampai{" "}
          <span className="font-medium">
            {indexOfLastItem > filteredKegiatans.length ? filteredKegiatans.length : indexOfLastItem}
          </span>{" "}
          dari <span className="font-medium">{filteredKegiatans.length}</span> data
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