import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AcaraAddForm from "../../components/Acara/Form/AcaraAddForm";
export default function AddAcara() {
  return (
    <div>
      <PageMeta
        title="Tambah Acara - KapanNikah"
        description="s"
      />
      <PageBreadcrumb pageTitle="Tambah Acara" />
      <div className="grid grid-cols-1 gap-6 ">
        <div className="space-y-12">
          <AcaraAddForm />
         
        </div>
      </div>
    </div>
  );
}