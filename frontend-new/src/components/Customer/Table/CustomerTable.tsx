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

// 1. Tambahkan properti phone ke interface agar tidak dianggap error oleh TypeScript
interface Customer {
  id: number;
  name: string;
  email: string;
  role_id: number;
  phone?: string; 
}

export default function CustomerTable() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Search dan Pagination 👇
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Batasan muat data per halaman

  const getCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  // 2. LOGIKA SEARCH: Memfilter data berdasarkan input user (Nama, Email, atau Phone)
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  // 3. LOGIKA PAGINATION: Memotong (slice) data agar yang tampil maksimal hanya 20 baris
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Reset ke halaman 1 jika user mengetik sesuatu di kolom search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };
  const handleView = (id: number) => {
    navigate(`/pelanggan/view/${id}`);
    // alert(`Menampilkan detail customer dengan ID: ${id}`);
    // Implementasikan navigasi atau modal detail di sini
  };

  const handleEdit = (id: number) => {
    navigate(`/pelanggan/edit/${id}`);
    // alert(`Membuka halaman edit customer dengan ID: ${id}`);
    // Contoh jika pakai React Router: navigate(`/customer/edit/${id}`)
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah kamu yakin ingin menghapus pelanggan ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Pelanggan berhasil dihapus!");
        getCustomers(); // Refresh data setelah menghapus
      } catch (error) {
        alert(
          err.response?.data?.message ||
          "Gagal menghapus pelanggan"
        );
      }
    }
  };
  // const handleSendPasswordToEmail = async (id: number) => {
  //   try {
  //     const token = localStorage.getItem("token");
      
  //     await axios.post(
  //       `${import.meta.env.VITE_API_URL}/api/customers/sendMessage/${id}`, 
  //       {}, 
  //       {   
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
      
  //     alert("Password berhasil dikirim!");
  //     getCustomers(); 
  //   } catch (error: any) { 
  //     alert(
  //       error.response?.data?.message ||
  //       "Gagal Mengirim Password"
  //     );
  //   }
  // };
  return (
    <div className="space-y-4">
      {/* 4. INPUT SEARCH INPUT */}
      <div className="flex justify-left">
        <input
          type="text"
          placeholder="Cari nama, email, atau nomor HP..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-center text-sm text-gray-500">Loading...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">Tidak Ada Customer</p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            {/* Struktur Table Diperbaiki: <Table> membungkus proses looping data */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nama
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nomor Handphone
                  </TableCell>
                  {/* Kolom Baru 👇 */}
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-center text-theme-xs">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((customer) => (
                  <TableRow key={customer.ID}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {customer.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {customer.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {customer.phone || "-"}
                    </TableCell>
                    
                    {/* Kolom Aksi 👇 */}
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol View */}
                        <button
                          onClick={() => handleView(customer.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          Detail
                        </button>

                        {/* Tombol Edit */}
                        <button
                          onClick={() => handleEdit(customer.ID)}
                          className="px-2.5 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100 transition"
                        >
                          Ubah
                        </button>

                        {/* Tombol Delete */}
                        <button
                          onClick={() => handleDelete(customer.ID)}
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
            {indexOfLastItem > filteredCustomers.length ? filteredCustomers.length : indexOfLastItem}
          </span>{" "}
          dari <span className="font-medium">{filteredCustomers.length}</span> data
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