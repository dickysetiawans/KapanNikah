import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AcaraViewForm from "../../components/Acara/Form/AcaraViewForm";


export default function ViewAcara() {
  return (
    <div>
      <PageMeta
        title="Detail Acara - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Detail Acara" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-12">
          <AcaraViewForm />
        </div>
      </div> 
    </div>
  );
}