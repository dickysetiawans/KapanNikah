import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import Select from "react-select";

// --- Import Leaflet Components ---
import { MapContainer, TileLayer, Marker, LayersControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// --- WAJIB: CSS Leaflet & Geosearch, tanpa ini peta berantakan & search box gak muncul ---
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

// --- Helper: ubah "Pernikahan  Clara dan Budi" -> "pernikahan-clara-dan-budi" ---
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // hapus aksen/diakritik
    .replace(/[^a-z0-9\s-]/g, "") // buang karakter selain huruf/angka/spasi/strip
    .replace(/\s+/g, "-") // spasi (termasuk spasi ganda) -> satu strip
    .replace(/-+/g, "-") // strip ganda -> satu strip
    .replace(/^-+|-+$/g, ""); // buang strip di awal/akhir
}

// --- Helper: ISO string dari backend -> format yang dimengerti input datetime-local ---
function toDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// --- SOLUSI PETA NUMPUK: Komponen untuk mereset ukuran peta & menggerakkan kamera ---
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

// Komponen penangan klik langsung dan search di dalam peta
function MapPlugins({ onLocationAction }: { onLocationAction: (lat: number, lng: number) => void }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationAction(e.latlng.lat, e.latlng.lng);
    },
  });

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

    map.on("geosearch/showlocation", (result: any) => {
      const { x, y } = result.location;
      onLocationAction(y, x);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationAction]);

  return null;
}

export default function AcaraEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- States Form ---
  const [namaAcara, setNamaAcara] = useState("");
  const [selectedPelanggan, setSelectedPelanggan] = useState<OptionType | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<OptionType | null>(null);
  const [selectedPaket, setSelectedPaket] = useState<OptionType | null>(null);
  const [jumlahTamu, setJumlahTamu] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [latitude, setLatitude] = useState("-6.175392");
  const [longitude, setLongitude] = useState("106.827153");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.175392, 106.827153]);

  const [listPelanggan, setListPelanggan] = useState<OptionType[]>([]);
  const [listKegiatan, setListKegiatan] = useState<OptionType[]>([]);
  const [listPaket, setListPaket] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

        setListKegiatan(kegiatanOptions);
        setListPelanggan(pelangganOptions);

        const acara = resAcara.data;

        
        if (new Date(acara.tanggal_mulai) < new Date()) {
          alert("Acara ini sudah lewat waktu mulainya dan tidak bisa diedit lagi");
          navigate("/acara");
          return;
        }

        setNamaAcara(acara.nama_acara || "");
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
        setListPaket([]);
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
        setListPaket(options);

        if (initializing && pendingPaketId) {
          const match = options.find((o) => o.value === pendingPaketId);
          setSelectedPaket(match || null);
          setInitializing(false);
        } else if (!initializing) {
          setSelectedPaket(null);
        }
      } catch (err) {
        console.error("Gagal memuat data paket via AJAX:", err);
      }
    };

    if (!loading) fetchPaketByKegiatan();
  }, [selectedKegiatan, loading]);

  const handleMapAction = (lat: number, lng: number) => {
    setLatitude(String(lat));
    setLongitude(String(lng));
    setMapCenter([lat, lng]);
  };

  const handleUpdate = async () => {
    if (!namaAcara.trim()) return alert("Nama acara wajib diisi");
    if (!selectedPelanggan) return alert("Silakan pilih Pelanggan");
    if (!selectedKegiatan) return alert("Silakan pilih Kegiatan");
    if (!selectedPaket) return alert("Silakan pilih Paket");
    if (!jumlahTamu || Number(jumlahTamu) <= 0) return alert("Jumlah tamu harus lebih dari 0");
    if (!tanggalMulai || !tanggalSelesai) return alert("Waktu wajib diisi");
    if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) return alert("Waktu selesai tidak valid");

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/acara/${id}`,
        {
          nama_acara: namaAcara,
          slug: generateSlug(namaAcara), 
          pelanggan_id: Number(selectedPelanggan.value),
          kegiatan_id: Number(selectedKegiatan.value),
          paket_id: Number(selectedPaket.value),
          jumlah_tamu: Number(jumlahTamu),
          tanggal_mulai: new Date(tanggalMulai).toISOString(),
          tanggal_selesai: new Date(tanggalSelesai).toISOString(),
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Acara berhasil diperbarui");
      navigate("/acara");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui data acara");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ComponentCard title="Edit Acara"><p className="p-5 text-center text-sm text-gray-500">Memuat...</p></ComponentCard>;

  return (
    <ComponentCard title="Edit Data Acara">
      <div className="space-y-6">

        <div>
          <Label htmlFor="namaAcara">Nama Acara</Label>
          <Input type="text" value={namaAcara} onChange={(e) => setNamaAcara(e.target.value)} placeholder="Masukkan Nama Acara" />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input type="text" value={generateSlug(namaAcara)} readOnly />
          <p className="mt-1 text-xs text-gray-400">Slug otomatis dibuat dari nama acara (sama seperti saat menambah acara).</p>
        </div>

        <div style={{ overflow: "visible" }}>
          <Label htmlFor="pelanggan">Pelanggan / Customer</Label>
          <Select options={listPelanggan} placeholder="Cari & Pilih Nama Pelanggan..." isSearchable isClearable value={selectedPelanggan} onChange={(opt) => setSelectedPelanggan(opt)} className="text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div style={{ overflow: "visible" }}>
            <Label htmlFor="kegiatan">Kegiatan</Label>
            <Select
              options={listKegiatan}
              placeholder="Cari & Pilih Kegiatan..."
              isSearchable
              isClearable
              value={selectedKegiatan}
              onChange={(opt) => {
                setInitializing(false); 
                setSelectedKegiatan(opt);
              }}
              className="text-sm"
            />
          </div>

          <div style={{ overflow: "visible" }}>
            <Label htmlFor="paket">Paket Menu</Label>
            <Select options={listPaket} placeholder={selectedKegiatan ? "Cari & Pilih Paket..." : "Silakan pilih kegiatan terlebih dahulu"} isSearchable isClearable isDisabled={!selectedKegiatan} value={selectedPaket} onChange={(opt) => setSelectedPaket(opt)} className="text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="jumlahTamu">Jumlah Tamu</Label>
            <Input type="number" value={jumlahTamu} onChange={(e) => setJumlahTamu(e.target.value)} placeholder="Jumlah Tamu" />
          </div>
          <div>
            <Label htmlFor="tanggalMulai">Waktu Mulai</Label>
            <Input type="datetime-local" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tanggalSelesai">Waktu Selesai</Label>
            <Input type="datetime-local" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
          </div>
        </div>

        {/* --- PETA GEOLOKASI --- */}
        <div className="space-y-2">
          <Label>Lokasi Peta Acara</Label>
          <p className="text-xs text-gray-400">*Klik peta, geser pin, atau cari tempat pada kotak pencarian untuk mengubah titik lokasi. Ganti tampilan Satelit/Normal di pojok kiri atas.</p>

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

              <Marker
                position={[Number(latitude), Number(longitude)]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    handleMapAction(pos.lat, pos.lng);
                  },
                }}
              />

              <MapController center={mapCenter} />
              <MapPlugins onLocationAction={handleMapAction} />

            </MapContainer>
          </div>

          <input type="hidden" name="latitude" value={latitude} />
          <input type="hidden" name="longitude" value={longitude} />
        </div>

      </div>

      <div className="mt-8 flex gap-2">
        <button type="button" disabled={saving} onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
        <button type="button" onClick={() => navigate("/acara")} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Batal
        </button>
      </div>
    </ComponentCard>
  );
}