import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FiturAddForm from "../../components/Fitur/Form/FiturAddForm";
export default function AddFitur() {
  return (
    <div>
      <PageMeta
        title="Tambah Fitur - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Tambah Fitur" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <FiturAddForm />
         
        </div>
      </div>
    </div>
  );
}