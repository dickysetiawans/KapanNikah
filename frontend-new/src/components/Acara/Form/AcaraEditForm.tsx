import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import Select from "react-select";

import { MapContainer, TileLayer, Marker, LayersControl, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CODE_FITUR } from "../../../Codec/Codec";

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
interface FiturType {
  code_fitur: string;
  nama_fitur: string;
}
interface LoveStoryEditItem {
  id: number;
  kategori: string;
  tanggal: string;
  deskripsi: string;
}

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateOnly(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  const [namaAcara, setNamaAcara] = useState("");
  const [selectedPelanggan, setSelectedPelanggan] = useState<OptionType | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<OptionType | null>(null);
  const [selectedPaket, setSelectedPaket] = useState<OptionType | null>(null);
  const [jumlahTamu, setJumlahTamu] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  /* hanya untuk fitur menampilkan nama mempelai*/
  const [pengantinId, setPengantinId] = useState("");
  const [namaPengantinPria, setNamaPengantinPria] = useState("");
  const [namaPengantinWanita, setNamaPengantinWanita] = useState("");
  /* stop */

  /* hanya untuk fitur menampilkan nama orang tua mempelai*/
  const [orangTuaPengantinId, setOrangTuaPengantinId] = useState("");
  const [namaAyahPengantinPria, setNamaAyahPengantinPria] = useState("");
  const [namaIbuPengantinPria, setNamaIbuPengantinPria] = useState("");
  const [namaAyahPengantinWanita, setNamaAyahPengantinWanita] = useState("");
  const [namaIbuPengantinWanita, setNamaIbuPengantinWanita] = useState("");
  /* stop */

  /* hanya untuk fitur love story */
  const [listLoveStory, setListLoveStory] = useState<LoveStoryEditItem[]>([
    { id: 0, kategori: "", tanggal: "", deskripsi: "" }
  ]);
  /* stop */

  const [latitude, setLatitude] = useState("-6.175392");
  const [longitude, setLongitude] = useState("106.827153");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.175392, 106.827153]);

  const [listPelanggan, setListPelanggan] = useState<OptionType[]>([]);
  const [listKegiatan, setListKegiatan] = useState<OptionType[]>([]);
  const [listPaket, setListPaket] = useState<OptionType[]>([]);
  const [listFitur, setListFitur] = useState<FiturType[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  
  const [initializing, setInitializing] = useState(true);
  const [pendingPaketId, setPendingPaketId] = useState<string | null>(null);
  const [isFirstFiturLoad, setIsFirstFiturLoad] = useState(true);

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

        // Guard: acara yang waktu mulainya udah lewat gak boleh diedit
        if (new Date(acara.tanggal_mulai) < new Date()) {
          alert("Acara ini sudah lewat waktu mulainya dan tidak bisa diedit lagi");
          navigate("/acara");
          return;
        }

        setNamaAcara(acara.nama_acara || "");
        setJumlahTamu(acara.jumlah_tamu != null ? String(acara.jumlah_tamu) : "");
        setTanggalMulai(toDatetimeLocal(acara.tanggal_mulai));
        setTanggalSelesai(toDatetimeLocal(acara.tanggal_selesai));

        
        if (acara.pengantin) {
          setPengantinId(acara.pengantin.id);
          setNamaPengantinPria(acara.pengantin.nama_pengantin_pria || "");
          setNamaPengantinWanita(acara.pengantin.nama_pengantin_wanita || "");
        }
        if (acara.orang_tua_pengantin) {
          setOrangTuaPengantinId(acara.orang_tua_pengantin.id);
          setNamaAyahPengantinPria(acara.orang_tua_pengantin.nama_ayah_pengantin_pria || "");
          setNamaIbuPengantinPria(acara.orang_tua_pengantin.nama_ibu_pengantin_pria || "");
          setNamaAyahPengantinWanita(acara.orang_tua_pengantin.nama_ayah_pengantin_wanita || "");
          setNamaIbuPengantinWanita(acara.orang_tua_pengantin.nama_ibu_pengantin_wanita || "");
        }
        if (Array.isArray(acara.love_story) && acara.love_story.length > 0) {
          setListLoveStory(acara.love_story.map((ls: any) => ({
            id: ls.id || ls.ID || 0,
            kategori: ls.kategori || "",
            tanggal: toDateOnly(ls.tanggal),
            deskripsi: ls.deskripsi || "",
          })));
        }

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

        if (!res.data || res.data.length === 0) {
          setListPaket([]);
        } else {
          setListPaket(res.data.map((p: any) => ({
            value: String(p.id || p.ID),
            label: p.nama_paket,
          })));
        }

        if (initializing && pendingPaketId) {
        } else if (!initializing) {
          setSelectedPaket(null);
        }
      } catch (err) {
        console.error("Gagal memuat data paket via AJAX:", err);
      }
    };

    if (!loading) fetchPaketByKegiatan();
  }, [selectedKegiatan, loading]);
  useEffect(() => {
    if (initializing && pendingPaketId && listPaket.length > 0) {
      const match = listPaket.find((o) => o.value === pendingPaketId);
      if (match) setSelectedPaket(match);
    }
  }, [listPaket, initializing, pendingPaketId]);
  useEffect(() => {
    const fetchFiturByPaket = async () => {
      if (!selectedPaket) {
        setListFitur([]);
        if (!isFirstFiturLoad) {
          setNamaPengantinPria("");
          setNamaPengantinWanita("");
          setNamaAyahPengantinPria("");
          setNamaIbuPengantinPria("");
          setNamaAyahPengantinWanita("");
          setNamaIbuPengantinWanita("");
          setListLoveStory([{ id: 0, kategori: "", tanggal: "", deskripsi: "" }]);
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const paketId = selectedPaket.value;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/${paketId}/detail-fitur`, { headers });

        if (!res.data || res.data.length === 0) {
          setListFitur([]);
        } else {
          setListFitur(res.data.map((p: any) => ({
            code_fitur: p.code_fitur,
            nama_fitur: p.nama_fitur,
          })));
        }

        if (isFirstFiturLoad) {
         
          setIsFirstFiturLoad(false);
          setInitializing(false);
        } else {
          setNamaPengantinPria("");
          setNamaPengantinWanita("");
          setNamaAyahPengantinPria("");
          setNamaIbuPengantinPria("");
          setNamaAyahPengantinWanita("");
          setNamaIbuPengantinWanita("");
          setListLoveStory([{ id: 0, kategori: "", tanggal: "", deskripsi: "" }]);
        }
      } catch (err) {
        console.error("Gagal memuat data fitur via AJAX:", err);
      }
    };

    if (!loading) fetchFiturByPaket();
  }, [selectedPaket, loading]);

  const handleMapAction = (lat: number, lng: number) => {
    setLatitude(String(lat));
    setLongitude(String(lng));
    setMapCenter([lat, lng]);
  };

  const addRowListLoveStory = () => {
    setListLoveStory([...listLoveStory, { id: 0, kategori: "", tanggal: "", deskripsi: "" }]);
  };

  const removeRowListLoveStory = (index: number) => {
    const updated = [...listLoveStory];
    updated.splice(index, 1);
    setListLoveStory(updated);
  };

  const updateRowListLoveStory = (index: number, field: keyof LoveStoryEditItem, value: string) => {
    const updated = [...listLoveStory];
    updated[index] = { ...updated[index], [field]: value };
    setListLoveStory(updated);
  };

  const handleUpdate = async () => {
    if (!namaAcara.trim()) return alert("Nama acara wajib diisi");
    if (!selectedPelanggan) return alert("Silakan pilih Pelanggan");
    if (!selectedKegiatan) return alert("Silakan pilih Kegiatan");
    if (!selectedPaket) return alert("Silakan pilih Paket");
    if (!jumlahTamu || Number(jumlahTamu) <= 0) return alert("Jumlah tamu harus lebih dari 0");
    if (!tanggalMulai || !tanggalSelesai) return alert("Waktu wajib diisi");
    if (new Date(tanggalMulai) >= new Date(tanggalSelesai)) return alert("Waktu selesai tidak boleh lebih kecil dari waktu mulai");

    for (const fitur of listFitur) {
      if (fitur.code_fitur === CODE_FITUR.SHOW_BRIDE_NAME) {
        if (!namaPengantinPria.trim()) return alert("Nama pengantin pria wajib diisi");
        if (!namaPengantinWanita.trim()) return alert("Nama pengantin wanita wajib diisi");
        break;
      }
      if (fitur.code_fitur === CODE_FITUR.SHOW_PARENT_NAME) {
        if (!namaAyahPengantinPria.trim()) return alert("Nama ayah pengantin pria wajib diisi");
        if (!namaIbuPengantinPria.trim()) return alert("Nama ibu pengantin pria wajib diisi");
        if (!namaAyahPengantinWanita.trim()) return alert("Nama ayah pengantin wanita wajib diisi");
        if (!namaIbuPengantinWanita.trim()) return alert("Nama ibu pengantin wanita wajib diisi");
        break;
      }
      if (fitur.code_fitur === CODE_FITUR.SHOW_LOVE_STORY) {
        for (const story of listLoveStory) {
          if (!story.kategori.trim()) return alert("Kategori cerita cinta wajib diisi");
          if (!story.tanggal) return alert("Tanggal cerita cinta wajib diisi");
          if (!story.deskripsi.trim()) return alert("Deskripsi cerita cinta wajib diisi");
        }
        break;
      }
    }

    if (!confirm("Apakah kamu yakin ingin mengubah data acara ini?")) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/acara/update/${id}`,
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
          pengantin: {
            id:Number(pengantinId),
            nama_pengantin_pria: namaPengantinPria,
            nama_pengantin_wanita: namaPengantinWanita,
          },
          orang_tua_pengantin: {
            id:Number(orangTuaPengantinId),
            nama_ayah_pengantin_pria: namaAyahPengantinPria,
            nama_ibu_pengantin_pria: namaIbuPengantinPria,
            nama_ayah_pengantin_wanita: namaAyahPengantinWanita,
            nama_ibu_pengantin_wanita: namaIbuPengantinWanita,
          },
          love_story: listFitur.some((f) => f.code_fitur === CODE_FITUR.SHOW_LOVE_STORY)
            ? listLoveStory.map((s) => ({
                id: Number(s.id) || 0,
                kategori: s.kategori,
                tanggal: s.tanggal,
                deskripsi: s.deskripsi,
              }))
            : [],
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
          <i style={{ color: "red" }}>*Silahkan geser titik lokasi kalau perlu diubah</i>
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

        {listFitur.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada konfigurasi fitur</p>
        ) : (
          <>
            <p className="text-gray-400 text-sm">Beberapa konfigurasi untuk fitur</p>
            {listFitur.map((fitur, index) => (
              <div key={index}>
                {fitur.code_fitur === CODE_FITUR.SHOW_BRIDE_NAME && (
                  <div>
                    <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
                      Fitur "{fitur.nama_fitur}"
                    </div>
                    <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="namaPengantinPria">Nama Pengantin Pria</Label>
                          <Input type="text" value={namaPengantinPria} onChange={(e) => setNamaPengantinPria(e.target.value)} placeholder="Masukkan Nama Pengantin Pria" />
                        </div>
                        <div>
                          <Label htmlFor="namaPengantinWanita">Nama Pengantin Wanita</Label>
                          <Input type="text" value={namaPengantinWanita} onChange={(e) => setNamaPengantinWanita(e.target.value)} placeholder="Masukkan Nama Pengantin Wanita" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {fitur.code_fitur === CODE_FITUR.SHOW_PARENT_NAME && (
                  <div>
                    <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
                      Fitur "{fitur.nama_fitur}"
                    </div>
                    <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="namaAyahPengantinPria">Nama Ayah Pengantin Pria</Label>
                          <Input type="text" value={namaAyahPengantinPria} onChange={(e) => setNamaAyahPengantinPria(e.target.value)} placeholder="Masukkan Nama Ayah Pengantin Pria" />
                        </div>
                        <div>
                          <Label htmlFor="namaIbuPengantinPria">Nama Ibu Pengantin Pria</Label>
                          <Input type="text" value={namaIbuPengantinPria} onChange={(e) => setNamaIbuPengantinPria(e.target.value)} placeholder="Masukkan Nama Ibu Pengantin Pria" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="namaAyahPengantinWanita">Nama Ayah Pengantin Wanita</Label>
                          <Input type="text" value={namaAyahPengantinWanita} onChange={(e) => setNamaAyahPengantinWanita(e.target.value)} placeholder="Masukkan Nama Ayah Pengantin Wanita" />
                        </div>
                        <div>
                          <Label htmlFor="namaIbuPengantinWanita">Nama Ibu Pengantin Wanita</Label>
                          <Input type="text" value={namaIbuPengantinWanita} onChange={(e) => setNamaIbuPengantinWanita(e.target.value)} placeholder="Masukkan Nama Ibu Pengantin Wanita" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {fitur.code_fitur === CODE_FITUR.SHOW_LOVE_STORY && (
                  <div>
                    <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
                      Fitur "{fitur.nama_fitur}"
                    </div>
                    <div className="border border-gray-200 rounded-b-lg p-4 space-y-4">
                      <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                        {listLoveStory.map((story, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`kategori-${idx}`}>Kategori</Label>
                                <Input
                                  type="text"
                                  value={story.kategori}
                                  onChange={(e) => updateRowListLoveStory(idx, "kategori", e.target.value)}
                                  placeholder="Contoh: Pertama Bertemu"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`tanggal-${idx}`}>Tanggal</Label>
                                <Input
                                  type="date"
                                  value={story.tanggal}
                                  onChange={(e) => updateRowListLoveStory(idx, "tanggal", e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`deskripsi-${idx}`}>Deskripsi</Label>
                              <textarea
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
                                rows={3}
                                value={story.deskripsi}
                                onChange={(e) => updateRowListLoveStory(idx, "deskripsi", e.target.value)}
                                placeholder="Ceritakan kisahnya di sini..."
                              />
                            </div>
                            {listLoveStory.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRowListLoveStory(idx)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                Hapus Cerita
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addRowListLoveStory}
                        className="px-3 py-1.5 bg-[#138767] text-white text-sm rounded-lg hover:bg-[#0f6d53] transition"
                      >
                        + Tambah Cerita
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

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