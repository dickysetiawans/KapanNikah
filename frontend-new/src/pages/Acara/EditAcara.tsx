import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AcaraEditForm from "../../components/Acara/Form/AcaraEditForm";


export default function EditAcara() {
  return (
    <div>
      <PageMeta
        title="Edit Acara - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Edit Acara" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-12">
          <AcaraEditForm />
        </div>
      </div> 
    </div>
  );
}