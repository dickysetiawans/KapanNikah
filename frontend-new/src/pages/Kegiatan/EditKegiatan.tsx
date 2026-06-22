import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import KegiatanEditForm from "../../components/Kegiatan/Form/KegiatanEditForm";
export default function EditKegiatan() {
  return (
    <div>
      <PageMeta
        title="Ubah Kegiatan - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Ubah Kegiatan" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <KegiatanEditForm />
         
        </div>
      </div>
    </div>
  );
}