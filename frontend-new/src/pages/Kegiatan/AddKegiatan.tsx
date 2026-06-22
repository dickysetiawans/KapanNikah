import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import KegiatanAddForm from "../../components/Kegiatan/Form/KegiatanAddForm";
export default function AddKegiatan() {
  return (
    <div>
      <PageMeta
        title="Tambah Kegiatan - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Tambah Kegiatan" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <KegiatanAddForm />
         
        </div>
      </div>
    </div>
  );
}