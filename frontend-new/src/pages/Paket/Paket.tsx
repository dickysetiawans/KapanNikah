import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import PaketTable from "../../components/Paket/Table/PaketTable";
import Button from "../../components/ui/button/Button";

export default function Paket() {
  return (
    <>
      <PageMeta
        title="Paket - KapanNikah"
        description="-"
      />
      <PageBreadcrumb pageTitle="Paket" />

      <div className="space-y-6">
       <ComponentCard 
          title="Daftar Paket" 
          showButton={true} 
          buttonLabel="Tambah Paket" 
          buttonLink="/paket/tambah"
        >
          {/* Di sini cukup masukkan tabel saja */}
          <PaketTable />
        </ComponentCard>
      </div>
    </>
  ); 
}
