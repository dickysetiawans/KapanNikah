import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import CustomerTable from "../../components/Customer/Table/CustomerTable";
import Button from "../../components/ui/button/Button";

export default function Customer() {
  return (
    <>
      <PageMeta
        title="Pelanggan - KapanNikah"
        description="-"
      />
      <PageBreadcrumb pageTitle="Pelanggan" />

      <div className="space-y-6">
       <ComponentCard 
          title="Daftar Pelanggan" 
          showButton={true} 
          buttonLabel="Tambah Pelanggan" 
          buttonLink="/pelanggan/tambah"
        >
          {/* Di sini cukup masukkan tabel saja */}
          <CustomerTable />
        </ComponentCard>
      </div>
    </>
  ); 
}
