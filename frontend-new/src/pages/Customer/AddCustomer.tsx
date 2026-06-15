import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import CustomerAddForm from "../../components/Customer/Form/CustomerAddForm";


export default function AddCustomer() {
  return (
    <div>
      <PageMeta
        title="Tambah Pelanggan - KapanNikah"
        description=""
      />
      <PageBreadcrumb pageTitle="Tambah Pelanggan" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-12">
          <CustomerAddForm />
         
        </div>
      </div>
    </div>
  );
}