import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import KegiatanTable from "../../components/Kegiatan/Table/KegiatanTable";
import Button from "../../components/ui/button/Button";

export default function Kegiatan() {
  return (
    <>
      <PageMeta
        title="Kegiatan - KapanNikah"
        description="-"
      />
      <PageBreadcrumb pageTitle="Kegiatan" />

      <div className="space-y-6">
       <ComponentCard 
          title="Daftar Kegiatan" 
          showButton={true} 
          buttonLabel="Tambah Kegiatan" 
          buttonLink="/kegiatan/tambah"
        >
          {/* Di sini cukup masukkan tabel saja */}
          <KegiatanTable />
        </ComponentCard>
      </div>
    </>
  ); 
}
