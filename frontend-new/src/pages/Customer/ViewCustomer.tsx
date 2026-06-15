import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerViewForm from "../../components/Customer/Form/CustomerViewForm";

export default function ViewCustomer() {
  return (
    <div>
      <PageMeta
        title="Detail Pelanggan - KapanNikah"
        description="sss"
      />
      <PageBreadcrumb pageTitle="Detail Pelanggan" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <CustomerViewForm />
        </div>
      </div>
    </div>
  );
}