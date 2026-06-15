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
export default function PaketTable() {
  const navigate = useNavigate();
  const [hargaPaket, setHargaPaket] = useState(0);

  // State untuk Search dan Pagination 👇
  const [namaPaket, setNamaPaket] = useState("");
  const [deskripsiPaket, setDeskripsiPaket] = useState("");
  const getPakets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket`, {
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
}