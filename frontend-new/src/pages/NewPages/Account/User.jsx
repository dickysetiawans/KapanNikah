import Breadcrumb from "../components/Breadcrumb";

export default function Users() {
  return (
    <>
      <Breadcrumb
        title="Users"
      />

      <div className="bg-white rounded-xl shadow p-6">

        <div className="flex justify-between mb-4">

          <h2 className="font-bold">
            Data Users
          </h2>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add User
          </button>

        </div>

        <table className="w-full">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Admin</td>
              <td>admin@gmail.com</td>
            </tr>
          </tbody>

        </table>

      </div>
    </>
  );
}