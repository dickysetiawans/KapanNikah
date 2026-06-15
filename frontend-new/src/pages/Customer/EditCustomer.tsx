import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomerEditForm from "../../components/Customer/Form/CustomerEditForm";

export default function EditCustomer() {
  return (
    <div>
      <PageMeta
        title="Edit Pelanggan - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Edit Pelanggan" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <CustomerEditForm />
         
        </div>
      </div>
    </div>
  );
}