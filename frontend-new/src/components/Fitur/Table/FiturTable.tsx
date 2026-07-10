import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { CODE_FITUR } from "../../../Codec/Codec";
import { CheckLineIcon, CloseLineIcon } from "../../../icons"; // sesuaikan path file icon TailAdmin Anda
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";


interface Fiturs {
  id: number;
  nama_fitur: string;
  code_fitur: string;
  harga_fitur: number;
  is_active: bool;
}

export default function FiturTable() {
  const navigate = useNavigate();
  const [Fiturs, setFiturs] = useState<Fiturs[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");


  const handleView = (id: number) => {
    navigate(`/fitur/view/${id}`);
  
  };
  const handleEdit = (id: number) => {
    navigate(`/fitur/edit/${id}`);
  
  };
  

  const getFiturs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/fitur`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiturs(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFiturs();
  }, []);

  // 2. Perbaiki fungsi filter di bawah ini 👇
  const filteredFiturs = Fiturs.filter((Fitur) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Pastikan properti sesuai snake_case dan ubah Code (number) ke string
    const namaMatches = Fitur.nama_fitur?.toLowerCase().includes(searchLower);
    const codeMatches = Fitur.code_fitur?.toLowerCase().includes(searchLower);
    const hargaMatches = Fitur.harga_fitur?.toString().includes(searchLower);

    return namaMatches || codeMatches || hargaMatches;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFiturs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredFiturs.length / itemsPerPage) || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };
 
  const labelFitur = {
    [CODE_FITUR.SHOW_BRIDE_NAME]: "MNM - Menampilkan Nama Mempelai",
    [CODE_FITUR.SHOW_PARENT_NAME]: "MNOT - Menampilkan Nama Orang Tua",
    [CODE_FITUR.SHOW_EVENT_DATE]: "MTA - Menampilkan Tanggal Acara",
    [CODE_FITUR.SHOW_EVENT_LOCATION]: "MLA - Menampilkan Lokasi Acara",
    [CODE_FITUR.SHOW_MAP_LOCATION]: "GM - Google Maps",
    [CODE_FITUR.SHOW_COUNTDOWN]: "CA - Countdown Acara",
    [CODE_FITUR.SHOW_GALLERY]: "MGFM - Menampilkan Galeri Foto Mempelai",
    [CODE_FITUR.SHOW_LOVE_STORY]: "LS - Love Story",
    [CODE_FITUR.SHOW_EVENT_SCHEDULE]: "JA - Jadwal Acara",
    [CODE_FITUR.SHOW_DRESS_CODE]: "DC - Dress Code",
    [CODE_FITUR.SHOW_MUSIC]: "BM - Background Music",
    [CODE_FITUR.SHOW_VIDEO]: "VP - Video Prewedding",
    [CODE_FITUR.SHOW_LIVE_STREAMING]: "LST - Live Streaming",
    [CODE_FITUR.SHOW_RSVP]: "RSVP - Konfirmasi Kehadiran",
    [CODE_FITUR.SHOW_ATTENDANCE]: "FAK - Fitur Absensi Kehadiran",
    [CODE_FITUR.SHOW_GUEST_BOOK]: "BT - Buku Tamu",
    [CODE_FITUR.SHOW_WEDDING_GIFT]: "WG - Wedding Gift",
    [CODE_FITUR.SHOW_QR_CHECKIN]: "QRC - QR Check-in",
    [CODE_FITUR.SHOW_SEAT_NUMBER]: "NMK - Nomor Meja / Kursi",
    [CODE_FITUR.SHOW_INVITATION_TO]: "NTU - Nama Tamu Undangan",
    [CODE_FITUR.SHOW_SHARE_BUTTON]: "TS - Tombol Share",
    [CODE_FITUR.SHOW_HEALTH_PROTOCOL]: "PK - Protokol Kesehatan",
    [CODE_FITUR.SHOW_CONTACT_PERSON]: "CP - Contact Person",
    [CODE_FITUR.SHOW_THANK_YOU_NOTE]: "UTK - Ucapan Terima Kasih",
    [CODE_FITUR.SHOW_VIDEO]: "VP - Video Prewedding",
  
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-left">
        <input
          type="text"
          placeholder="Cari nama Fitur, atau Code Fitur..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <p className="p-5 text-center text-sm text-gray-500">Loading...</p>
        ) : filteredFiturs.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">Tidak Ada Fitur</p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Nama Fitur
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Harga Fitur
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Kode Fitur
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-xs">
                    Aktif
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-center text-theme-xs">
                    Aksi
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((Fitur) => (
                  <TableRow key={Fitur.id}>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {Fitur.nama_fitur}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {/* Format ke rupiah atau lokal biar rapi */}
                      Rp {Fitur.harga_fitur.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm">
                      {labelFitur[Fitur.code_fitur] || Fitur.code_fitur}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <div className="flex justify-left">
                        {Fitur.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-md dark:bg-green-500/10 dark:text-green-400">
                            <CheckLineIcon className="w-4 h-4" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md dark:bg-red-500/10 dark:text-red-400">
                            <CloseLineIcon className="w-4 h-4" />
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-theme-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(Fitur.id)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleEdit(Fitur.id)}
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
          Menampilkan <span className="font-medium">{filteredFiturs.length === 0 ? 0 : indexOfFirstItem + 1}</span> sampai{" "}
          <span className="font-medium">
            {indexOfLastItem > filteredFiturs.length ? filteredFiturs.length : indexOfLastItem}
          </span>{" "}
          dari <span className="font-medium">{filteredFiturs.length}</span> data
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