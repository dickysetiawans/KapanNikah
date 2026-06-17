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

interface Pakets {
  id: number;
  nama_paket: string;
  harga_paket: float;
  
}

export default function PaketTable() {
  const navigate = useNavigate();
  const [pakets, setPakets] = useState<Pakets[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hargaPaket, setHargaPaket] = useState(0);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(true);

  // State untuk Search dan Pagination 👇
  const [namaPaket, setNamaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getPakets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPakets(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    getPakets();
  }, []);

  const filteredPakets = pakets.filter((paket) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      paket.namaPaket?.toLowerCase().includes(searchLower) ||
      paket.hargaPaket?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPakets.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredPakets.length / itemsPerPage);

  // Reset ke halaman 1 jika user mengetik sesuatu di kolom search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };
  return (
    <div className="space-y-4">
       <div className="flex justify-left">
        <input
          type="text"
          placeholder="Cari nama paket, atau harga Paket..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-center text-sm text-gray-500">Loading...</p>
        ) : filteredPakets.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">Tidak Ada Paket</p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            {/* Struktur Table Diperbaiki: <Table> membungkus proses looping data */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nama Paket
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Harga Paket
                  </TableCell>
                  {/* Kolom Baru 👇 */}
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-center text-theme-xs">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((paket) => (
                  <TableRow key={paket.ID}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {paket.nama_paket}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {paket.harga_paket}
                    </TableCell>
                   
                    {/* Kolom Aksi 👇 */}
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol View */}
                        <button
                          onClick={() => handleView(paket.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          Detail
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => handleEdit(paket.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition"
                        >
                          Ubah
                        </button>

                        {/* Tombol Delete */}
                        <button
                          onClick={() => handleDelete(paket.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                       {/* <button
                          onClick={() => handleSendPasswordToEmail(customer.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-green-600 bg-red-50 rounded-md hover:bg-green-100 transition"
                        >
                          Kirim Password
                        </button>*/}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 5. TOMBOL KONTROL PAGINATION */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl">
        <span className="text-sm text-gray-700">
          Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai{" "}
          <span className="font-medium">
            {indexOfLastItem > filteredPakets.length ? filteredPakets.length : indexOfLastItem}
          </span>{" "}
          dari <span className="font-medium">{filteredPakets.length}</span> data
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