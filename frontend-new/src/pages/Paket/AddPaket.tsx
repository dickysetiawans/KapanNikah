import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PaketAddForm from "../../components/Paket/Form/PaketAddForm";


export default function AddPaket() {
  return (
    <div>
      <PageMeta
        title="Tambah Paket - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Tambah Paket" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <PaketAddForm />
         
        </div>
      </div>
    </div>
  );
}