import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PaketEditForm from "../../components/Paket/Form/PaketEditForm";


export default function EditPaket() {
  return (
    <div>
      <PageMeta
        title="Edit Paket - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Edit Paket" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <PaketEditForm />
        </div>
      </div> 
    </div>
  );
}