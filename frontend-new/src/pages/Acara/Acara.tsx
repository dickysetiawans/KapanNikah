import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import AcaraTable from "../../components/Acara/Table/AcaraTable";
import Button from "../../components/ui/button/Button";

export default function Acara() {
  return (
    <>
      <PageMeta
        title="Acara - KapanNikah"
        description="-"
      />
      <PageBreadcrumb pageTitle="Acara" />

      <div className="space-y-6">
       <ComponentCard 
          title="Daftar Acara" 
          showButton={true} 
          buttonLabel="Tambah Acara" 
          buttonLink="/acara/tambah"
        >
          {/* Di sini cukup masukkan tabel saja */}
          <AcaraTable />
        </ComponentCard>
      </div>
    </>
  ); 
}
