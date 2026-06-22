import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FiturEditForm from "../../components/Fitur/Form/FiturEditForm";


export default function EditFitur() {
  return (
    <div>
      <PageMeta
        title="Ubah Fitur - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Ubah Fitur" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <FiturEditForm />
        </div>
      </div> 
    </div>
  );
}