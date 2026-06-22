import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FiturViewForm from "../../components/Fitur/Form/FiturViewForm";


export default function ViewFitur() {
  return (
    <div>
      <PageMeta
        title="Detail Fitur - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Detail Fitur" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <FiturViewForm />
        </div>
      </div> 
    </div>
  );
}