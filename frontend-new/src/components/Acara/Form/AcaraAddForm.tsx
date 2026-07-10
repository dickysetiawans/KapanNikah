import { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axios from "axios";
import { useNavigate } from "react-router";
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
interface LoveStoryList {
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

export default function AcaraAddForm() {
  const navigate = useNavigate();
  const [namaAcara, setNamaAcara] = useState("");
  const [selectedPelanggan, setSelectedPelanggan] = useState<OptionType | null>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<OptionType | null>(null);
  const [selectedPaket, setSelectedPaket] = useState<OptionType | null>(null);
  const [jumlahTamu, setJumlahTamu] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  
  /* hanya untuk fitur menampilkan nama mempelai*/
  const [namaPengantinPria, setNamaPengantinPria] = useState("");
  const [namaPengantinWanita, setNamaPengantinWanita] = useState("");
  /* stop */

  /* hanya untuk fitur menampilkan nama orang tua mempelai*/
  const [namaAyahPengantinPria, setNamaAyahPengantinPria] = useState("");
  const [namaIbuPengantinPria, setNamaIbuPengantinPria] = useState("");
  const [namaAyahPengantinWanita, setNamaAyahPengantinWanita] = useState("");
  const [namaIbuPengantinWanita, setNamaIbuPengantinWanita] = useState("");
  /* stop */

  const [latitude, setLatitude] = useState("-6.175392");
  const [longitude, setLongitude] = useState("106.827153");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.175392, 106.827153]);

  const [listPelanggan, setListPelanggan] = useState<OptionType[]>([]);
  const [listKegiatan, setListKegiatan] = useState<OptionType[]>([]);
  const [listPaket, setListPaket] = useState<OptionType[]>([]);
  const [listFitur, setListFitur] = useState<FiturType[]>([]);

  const [loading, setLoading] = useState(true);
  const [listLoveStory, setListLoveStory] = useState<LoveStoryList[]>([
    { kategori: "", tanggal: "", deskripsi: "" }
  ]);
  useEffect(() => {
    const fetchInitialMasterData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const resKegiatan = await axios.get(`${import.meta.env.VITE_API_URL}/api/kegiatan`, { headers });
        setListKegiatan(resKegiatan.data.map((k: any) => ({
          value: String(k.id || k.ID),
          label: `${k.nama_kegiatan} (${k.code_kegiatan || 'No Code'})`,
        })));

        const resPelanggan = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers/active`, { headers });
        setListPelanggan(resPelanggan.data.map((u: any) => ({
          value: String(u.id || u.ID),
          label: u.name || u.nama || `User #${u.id}`,
        })));

      } catch (err) {
        console.error("Gagal memuat data master awal:", err);
        alert("Gagal memuat data pendukung form.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMasterData();
  }, []);

  useEffect(() => {
    const fetchPaketByKegiatan = async () => {
      if (!selectedKegiatan) {
        setListPaket([]);
        setSelectedPaket(null);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const kegiatanId = selectedKegiatan.value;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/kegiatan/${kegiatanId}`, { headers });
        
        if (!res.data || res.data.length === 0) {
          alert("Tidak ada paket aktif yang tersedia untuk kegiatan ini.");
          setListPaket([]);
        } else {
          setListPaket(res.data.map((p: any) => ({
            value: String(p.id || p.ID),
            label: p.nama_paket,
          })));
        }
        setSelectedPaket(null);
      } catch (err) {
        console.error("Gagal memuat data paket via AJAX:", err);
      }
    };

    if (!loading) fetchPaketByKegiatan();
  }, [selectedKegiatan, loading]);

  useEffect(() => {
    const fetchFiturByPaket = async () => {
     setNamaPengantinPria("");
     setNamaPengantinWanita("");
      if (!selectedPaket) {
        setListFitur([]);

        return;
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const paketId = selectedPaket.value;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/paket/${paketId}/detail-fitur`, { headers });
        
        if (!res.data || res.data.length === 0) {
          alert("Tidak ada fitur di paket ini");
          setListFitur([]);
        } else {
          setListFitur(res.data.map((p: any) => ({
            code_fitur: p.code_fitur,
            nama_fitur: p.nama_fitur,
          })));
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

  const handleSubmit = async () => {
    if (!namaAcara.trim()) return alert("Nama acara wajib diisi");
    if (!selectedPelanggan) return alert("Silakan pilih Pelanggan");
    if (!selectedKegiatan) return alert("Silakan pilih Kegiatan");
    if (!selectedPaket) return alert("Silakan pilih Paket");
    if (!jumlahTamu || Number(jumlahTamu) <= 0) return alert("Jumlah tamu harus lebih dari 0");
    if (!tanggalMulai || !tanggalSelesai) return alert("Waktu wajib diisi");
    if (new Date(tanggalMulai) < new Date()) return alert("Waktu mulai tidak boleh sebelum waktu sekarang");
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
    if (confirm("Apakah kamu yakin ingin menambah data acara ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/acara`,
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
            pengantin:{
              nama_pengantin_pria: namaPengantinPria,
              nama_pengantin_wanita: namaPengantinWanita,
            },
            orang_tua_pengantin:{
              nama_ayah_pengantin_pria: namaAyahPengantinPria,
              nama_ibu_pengantin_pria: namaIbuPengantinPria,
              nama_ayah_pengantin_wanita: namaAyahPengantinWanita,
              nama_ibu_pengantin_wanita: namaIbuPengantinWanita,
            },
            love_story: listFitur.some((f) => f.code_fitur === CODE_FITUR.SHOW_LOVE_STORY)
              ? listLoveStory.map((s) => ({
                  kategori: s.kategori,
                  tanggal: s.tanggal,
                  deskripsi: s.deskripsi,
                }))
              : [],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Acara berhasil disimpan");
        navigate("/acara");
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menyimpan data acara");
      }
    }
    
  };
  const addRowListLoveStory = () => {
    setListLoveStory([...listLoveStory, { kategori: "", tanggal: "", deskripsi: "" }]);
  };

  const removeRowListLoveStory = (index: number) => {
    const updated = [...listLoveStory];
    updated.splice(index, 1);
    setListLoveStory(updated);
  };

  const updateRowListLoveStory = (index: number, field: keyof LoveStoryList, value: string) => {
    const updated = [...listLoveStory];
    updated[index] = { ...updated[index], [field]: value };
    setListLoveStory(updated);
  };
  if (loading) return <ComponentCard title="Tambah Acara"><p className="p-5 text-center text-sm text-gray-500">Memuat...</p></ComponentCard>;

  return (
    <ComponentCard title="Tambah Data Acara">
      <div className="space-y-6">
        
        <div>
          <Label htmlFor="namaAcara">Nama Acara</Label>
          <Input type="text" value={namaAcara} onChange={(e) => setNamaAcara(e.target.value)} placeholder="Masukkan Nama Acara" />
        </div>

        <div style={{ overflow: "visible" }}>
          <Label htmlFor="pelanggan">Pelanggan / Customer</Label>
          <Select options={listPelanggan} placeholder="Cari & Pilih Nama Pelanggan..." isSearchable isClearable value={selectedPelanggan} onChange={(opt) => setSelectedPelanggan(opt)} className="text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div style={{ overflow: "visible" }}>
            <Label htmlFor="kegiatan">Kegiatan</Label>
            <Select options={listKegiatan} placeholder="Cari & Pilih Kegiatan..." isSearchable isClearable value={selectedKegiatan} onChange={(opt) => setSelectedKegiatan(opt)} className="text-sm" />
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
        <div className="space-y-2">
          <Label>Lokasi Peta Acara</Label>
          <i style={{ color: "red" }}>*Silahkan titik lokasi nya di geser ke titik yg benar</i>
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
                  }
                }}
              /> 
              <MapController center={mapCenter} />
              <MapPlugins onLocationAction={handleMapAction} />
            </MapContainer>                    
          </div>
                  {/* Koordinat disembunyikan */}
          <input type="hidden" name="latitude" value={latitude} />
          <input type="hidden" name="longitude" value={longitude} />
        </div>        
        {listFitur.length === 0 ? (
          <p className="text-gray-400 text-sm">Belum ada konfiguration fitur</p>
        ) : (
        <p className="text-gray-400 text-sm">Beberapa konfigurasi untuk fitur</p>,
          listFitur.map((fitur, index) => (
            
            <div key={index}>
              {fitur.code_fitur === CODE_FITUR.SHOW_BRIDE_NAME && (
                <div>
                  {/* Section header gelap */}
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
                  {/* Section header gelap */}
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
                  {/* Section header gelap */}
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
          ))
        )}
        

      </div>

      <div className="mt-8 flex gap-2">
        <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Simpan Acara
        </button>
        <button type="button" onClick={() => navigate("/acara")} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}