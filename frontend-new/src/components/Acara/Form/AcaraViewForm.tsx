import { useState, useEffect, useMemo  } from "react";
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

interface PengantinData {
  nama_pengantin_pria?: string;
  nama_pengantin_wanita?: string;
}

interface OrangTuaPengantinData {
  nama_ayah_pengantin_pria?: string;
  nama_ibu_pengantin_pria?: string;
  nama_ayah_pengantin_wanita?: string;
  nama_ibu_pengantin_wanita?: string;
}

interface LoveStoryData {
  kategori: string;
  tanggal: string;
  deskripsi: string;
}
interface GaleriData {
  url_gambar: string;
  keterangan: string;
}
interface ContactPersonData {
  deskripsi?: string;
  no_hanphone?: string;
}
interface UcapanTerimakasihData {
  ucapan?: string;
}
interface JadwalAcaraData {
  detail_acara: string;
  mulai_acara: string;
  selesai_acara: string;
}
function toDatetimeLocal(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toReadableDate(isoString: string): string {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
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

export default function AcaraViewForm() {
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

  
  const [pengantin, setPengantin] = useState<PengantinData | null>(null);
  const [orangTuaPengantin, setOrangTuaPengantin] = useState<OrangTuaPengantinData | null>(null);
  const [loveStory, setLoveStory] = useState<LoveStoryData[]>([]);
  const [galeri, setGaleri] = useState<GaleriData[]>([]);

  const [loading, setLoading] = useState(true);

  const [initializing, setInitializing] = useState(true);
  const [pendingPaketId, setPendingPaketId] = useState<string | null>(null);

 const [contactPerson, setContactPerson] = useState<ContactPersonData | null>(null);
 const [UcapanTerimakasih, setUcapanTerimakasih] = useState<UcapanTerimakasihData | null>(null);
 const [jadwalAcara, setJadwalAcara] = useState<JadwalAcaraData[]>([]);
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
        setPengantin(acara.pengantin || null);
        setOrangTuaPengantin(acara.orang_tua_pengantin || null);
        setLoveStory(Array.isArray(acara.love_story) ? acara.love_story : []);
        setContactPerson(acara.contact_person || null);
        setUcapanTerimakasih(acara.ucapan_terimakasih || null);
        setGaleri(
          Array.isArray(acara.galeri)
            ? acara.galeri.map((g: any) => ({
                url_gambar: g.url_gambar?.startsWith("http") ? g.url_gambar : `${API}${g.url_gambar}`,
                keterangan: g.keterangan || "",
              }))
            : []
        );
        setJadwalAcara(Array.isArray(acara.jadwal_acara) ? acara.jadwal_acara : []);
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
          setSelectedPaket(null);
        }
      } catch (err) {
        console.error("Gagal memuat data paket via AJAX:", err);
      }
    };

    if (!loading) fetchPaketByKegiatan();
  }, [selectedKegiatan, loading]);

  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " ";
  };
  const formatJam = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " ";
  };
  function isMultiDayEvent(mulai: string, selesai: string): boolean {
    if (!mulai || !selesai) return false;
    const start = new Date(mulai);
    const end = new Date(selesai);
    return (
      start.getFullYear() !== end.getFullYear() ||
      start.getMonth() !== end.getMonth() ||
      start.getDate() !== end.getDate()
    );
  }
  const isMultiDay = useMemo(
    () => isMultiDayEvent(tanggalMulai, tanggalSelesai), // atau isMoreThanOneDay
    [tanggalMulai, tanggalSelesai]
  );
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
        {pengantin && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
             Data Pengantin
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="namaPengantinPria">Nama Pengantin Pria</Label>
                  <Input type="text" value={pengantin.nama_pengantin_pria || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="namaPengantinWanita">Nama Pengantin Wanita</Label>
                  <Input type="text" value={pengantin.nama_pengantin_wanita || "-"} readOnly />
                </div>
              </div>
            </div>
          </div>          
        )}

        {orangTuaPengantin && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
             Data Orang Tua Pengantin
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namaAyahPria">Nama Ayah Pengantin Pria</Label>
                  <Input type="text" value={orangTuaPengantin.nama_ayah_pengantin_pria || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="namaIbuPria">Nama Ibu Pengantin Pria</Label>
                  <Input type="text" value={orangTuaPengantin.nama_ibu_pengantin_pria || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="namaAyahWanita">Nama Ayah Pengantin Wanita</Label>
                  <Input type="text" value={orangTuaPengantin.nama_ayah_pengantin_wanita || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="namaIbuWanita">Nama Ibu Pengantin Wanita</Label>
                  <Input type="text" value={orangTuaPengantin.nama_ibu_pengantin_wanita || "-"} readOnly />
                </div>
              </div>
            </div>
          </div> 
          
        )}
        {contactPerson && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
             Data Nomor Kontak
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="no_hanphone">Nomor Kontak</Label>
                  <Input type="text" value={contactPerson.no_hanphone || "-"} readOnly />
                </div>
                <div>
                  <Label htmlFor="deskripsi">Deskripsi Kontak</Label>
                  <Input type="text" value={contactPerson.deskripsi || "-"} readOnly />
                </div>
              </div>
            </div>
          </div>          
        )}
        {UcapanTerimakasih && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
             Data Ucapan Terimakasih
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-2">
              <div>
                  <Label htmlFor="ucapan">Ucapan</Label>
                  <Input type="text" value={UcapanTerimakasih.ucapan || "-"} readOnly />
                </div>
            </div>
          </div>          
        )}
        {loveStory.length > 0 && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
              Love Story
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-3 overflow-y-auto max-h-[300px]">
              {loveStory.map((story, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-sm text-gray-700">{story.kategori}</span>
                    <span className="text-xs text-gray-400">{toReadableDate(story.tanggal)}</span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{story.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {galeri.length > 0 && (
          <div>
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
              Galeri Foto
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] pr-1">
                {galeri.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-2 space-y-1">
                    <img
                      src={item.url_gambar}
                      alt={item.keterangan || `Foto galeri ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    {item.keterangan && (
                      <p className="text-xs text-gray-500 text-center">{item.keterangan}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {jadwalAcara.length > 0 && (
          <div>
            {/* Section header gelap */}
            <div className="bg-[#138767] text-white px-4 py-3 rounded-t-lg font-semibold tracking-wide uppercase text-sm">
             Jadwal Acara
            </div>
            <div className="border border-gray-200 rounded-b-lg p-4 space-y-3 overflow-y-auto max-h-[300px]">
              <table className="w-full border-collapse border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="p-3 border-b border-gray-200">No</th>
                    <th className="p-3 border-b border-gray-200">Waktu</th>
                    <th className="p-3 border-b border-gray-200">Detail Acara</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jadwalAcara.map((jadwal, idx) => (
                    <tr key={idx}>
                      <td className="p-3" >
                        {idx + 1}
                      </td>
                      <td className="p-3">
                        {isMultiDay
                          ? `${formatTanggal(jadwal.mulai_acara)} - ${formatTanggal(jadwal.selesai_acara)}`
                          : `${formatJam(jadwal.mulai_acara)} - ${formatJam(jadwal.selesai_acara)}`}
                      </td>
                      <td className="p-3" >
                        <p>{jadwal.detail_acara}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>           
              
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-2">
        <button type="button" onClick={() => navigate("/acara")} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
          Kembali
        </button>
      </div>
    </ComponentCard>
  );
}