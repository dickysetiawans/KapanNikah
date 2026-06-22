import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import FiturTable from "../../components/Fitur/Table/FiturTable";
import Button from "../../components/ui/button/Button";

export default function Fitur() {
  return (
    <>
      <PageMeta
        title="Fitur - KapanNikah"
        description="-"
      />
      <PageBreadcrumb pageTitle="Fitur" />

      <div className="space-y-6">
       <ComponentCard 
          title="Daftar Fitur" 
          showButton={true} 
          buttonLabel="Tambah Fitur" 
          buttonLink="/fitur/tambah"
        >
          {/* Di sini cukup masukkan tabel saja */}
          <FiturTable />
        </ComponentCard>
      </div>
    </>
  ); 
}
