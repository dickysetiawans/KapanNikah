import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PaketViewForm from "../../components/Paket/Form/PaketViewForm";


export default function ViewPaket() {
  return (
    <div>
      <PageMeta
        title="Detail Paket - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Detail Paket" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-12">
          <PaketViewForm />
        </div>
      </div> 
    </div>
  );
}