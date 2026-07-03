import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useParams, useNavigate } from "react-router";

import { MapContainer, TileLayer, Marker, LayersControl, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface OptionType {
  value: string;
  label: string;
}

function toDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}


function MapPlugins() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      position: "topright",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Cari lokasi / nama jalan...",
    });

    map.addControl(searchControl);


    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

export default function AcaraDetailForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [namaAcara, setNamaAcara] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedPelanggan, setSelectedPelanggan] = useState<OptionType | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<OptionType | null>(null);
  const [selectedPaket, setSelectedPaket] = useState<OptionType | null>(null);
  const [jumlahTamu, setJumlahTamu] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [latitude, setLatitude] = useState("-6.175392");
  const [longitude, setLongitude] = useState("106.827153");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.175392, 106.827153]);

  const [loading, setLoading] = useState(true);

  const [initializing, setInitializing] = useState(true);
  const [pendingPaketId, setPendingPaketId] = useState<string | null>(null);

 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const API = import.meta.env.VITE_API_URL;

        const [resKegiatan, resPelanggan, resAcara] = await Promise.all([
          axios.get(`${API}/api/kegiatan`, { headers }),
          axios.get(`${API}/api/customers/active`, { headers }),
          axios.get(`${API}/api/acara/${id}`, { headers }),
        ]);

        const kegiatanOptions: OptionType[] = resKegiatan.data.map((k: any) => ({
          value: String(k.id || k.ID),
          label: `${k.nama_kegiatan} (${k.code_kegiatan || "No Code"})`,
        }));
        const pelangganOptions: OptionType[] = resPelanggan.data.map((u: any) => ({
          value: String(u.id || u.ID),
          label: u.name || u.nama || `User #${u.id}`,
        }));

        const acara = resAcara.data;

        setNamaAcara(acara.nama_acara || "");
        setSlug(acara.slug || "");
        setJumlahTamu(acara.jumlah_tamu != null ? String(acara.jumlah_tamu) : "");
        setTanggalMulai(toDatetimeLocal(acara.tanggal_mulai));
        setTanggalSelesai(toDatetimeLocal(acara.tanggal_selesai));

        const lat = Number(acara.latitude);
        const lng = Number(acara.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          setLatitude(String(lat));
          setLongitude(String(lng));
          setMapCenter([lat, lng]);
        }

        const pelangganMatch = pelangganOptions.find((o) => o.value === String(acara.pelanggan_id));
        setSelectedPelanggan(pelangganMatch || null);

        
        setPendingPaketId(acara.paket_id != null ? String(acara.paket_id) : null);

        const kegiatanMatch = kegiatanOptions.find((o) => o.value === String(acara.kegiatan_id));
        setSelectedKegiatan(kegiatanMatch || null);

        
        if (!kegiatanMatch) setInitializing(false);
      } catch (err) {
        console.error("Gagal memuat data acara:", err);
        alert("Gagal memuat data acara");
        navigate("/acara");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  useEffect(() => {
    const fetchPaketByKegiatan = async () => {
      if (!selectedKegiatan) {
        if (!initializing) setSelectedPaket(null);
        return;
      }

       try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const kegiatanId = selectedKegiatan.value;
 
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/kegiatan/${kegiatanId}`, { headers });
        const options: OptionType[] = (res.data || []).map((p: any) => ({
          value: String(p.id || p.ID),
          label: p.nama_paket,
        }));
 
        if (initializing && pendingPaketId) {
          const match = options.find((o) => o.value === pendingPaketId);
          setSelectedPaket(match || null);
          setInitializing(false);
        } else if (!initializing) {
          // Kegiatan diganti manual oleh user -> paket lama otomatis gak relevan lagi
          setSelectedPaket(null);
        }
      } catch (err) {
        console.error("Gagal memuat data paket via AJAX:", err);
      }
    };

    if (!loading) fetchPaketByKegiatan();
  }, [selectedKegiatan, loading]);


  if (loading) return <ComponentCard title="Detail Acara"><p className="p-5 text-center text-sm text-gray-500">Memuat...</p></ComponentCard>;

  return (
    <ComponentCard title="Detail Acara">
      <div className="space-y-6">

        <div>
          <Label htmlFor="namaAcara">Nama Acara</Label>
          <Input type="text" value={namaAcara} readOnly />
        </div>

        <div>
          <Label htmlFor="pelanggan">Pelanggan / Customer</Label>
          <Input type="text" value={selectedPelanggan?.label || "-"} readOnly />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="kegiatan">Kegiatan</Label>
            <Input type="text" value={selectedKegiatan?.label || "-"} readOnly />
          </div>

          <div>
            <Label htmlFor="paket">Paket Menu</Label>
            <Input type="text" value={selectedPaket?.label || "-"} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="jumlahTamu">Jumlah Tamu</Label>
            <Input type="number" value={jumlahTamu} readOnly />
          </div>
          <div>
            <Label htmlFor="tanggalMulai">Waktu Mulai</Label>
            <Input type="datetime-local" value={tanggalMulai} readOnly />
          </div>
          <div>
            <Label htmlFor="tanggalSelesai">Waktu Selesai</Label>
            <Input type="datetime-local" value={tanggalSelesai} readOnly />
          </div>
        </div>

        
        <div className="space-y-2">
          <Label>Lokasi Peta Acara</Label>
          <p className="text-xs text-gray-400">Titik lokasi tidak dapat diubah di sini. Kamu tetap bisa mencari tempat atau mengganti tampilan peta (Satelit/Normal) di pojok kiri atas.</p>

          <div className="h-[450px] w-full rounded-lg overflow-hidden border border-gray-300 relative shadow-md" style={{ zIndex: 1 }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>

              <LayersControl position="topleft">
                <LayersControl.BaseLayer checked name="Satelit">
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Normal">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              <Marker position={[Number(latitude), Number(longitude)]} draggable={false} />

              <MapController center={mapCenter} />
              <MapPlugins />

            </MapContainer>
          </div>

          <input type="hidden" name="latitude" value={latitude} />
          <input type="hidden" name="longitude" value={longitude} />
        </div>

      </div>

      <div className="mt-8 flex gap-2">
        <button type="button" onClick={() => navigate("/acara")} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}