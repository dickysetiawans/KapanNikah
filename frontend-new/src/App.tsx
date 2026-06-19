// import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Customer from "./pages/Customer/Customer";
import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
// import AppLayout from "./layout/AppLayout";
// import { ScrollToTop } from "./components/common/ScrollToTop";
// import Home from "./pages/Dashboard/Home";
// import Login from "./pages/AuthPages/Login";
// export default function App() {
//   return (
//     <>
//       <Router>
//         <ScrollToTop />
//         <Routes>
//           {/* Dashboard Layout */}
//           <Route element={<AppLayout />}>
//             <Route index path="/" element={<Home />} />

//             {/* Others Page */}
//            {/* <Route path="/profile" element={<UserProfiles />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/blank" element={<Blank />} />*/}

//             {/* Forms */}
//             {/*<Route path="/form-elements" element={<FormElements />} />*/}

//             {/* Tables */}
//             {/*<Route path="/basic-tables" element={<BasicTables />} />*/}

//             {/* Ui Elements */}
// {/*            <Route path="/alerts" element={<Alerts />} />
//             <Route path="/avatars" element={<Avatars />} />
//             <Route path="/badge" element={<Badges />} />
//             <Route path="/buttons" element={<Buttons />} />
//             <Route path="/images" element={<Images />} />
//             <Route path="/videos" element={<Videos />} />*/}

//             {/* Charts */}
// {/*            <Route path="/line-chart" element={<LineChart />} />
//             <Route path="/bar-chart" element={<BarChart />} />*/}
//           </Route>

//           {/* Auth Layout */}
//           <Route path="/login" element={<Login />} />
//           {/*<Route path="/signup" element={<SignUp />} />*/}

//           {/* Fallback Route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }








import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import Login from "./pages/AuthPages/Login";
import NotFound from "./pages/OtherPage/NotFound";

import PrivateRoute from "./routes/PrivateRoute";
import GuestRoute from "./routes/GuestRoute";
import Logout from "./pages/AuthPages/Logout";
import RoleRoute from "./routes/RoleRoute";
import AddCustomer from "./pages/Customer/AddCustomer";
import EditCustomer from "./pages/Customer/EditCustomer";
import ViewCustomer from "./pages/Customer/ViewCustomer";
import Paket from "./pages/Paket/Paket";
import AddPaket from "./pages/Paket/AddPaket";
import EditPaket from "./pages/Paket/EditPaket";
import ViewPaket from "./pages/Paket/ViewPaket";

import Kegiatan from "./pages/Kegiatan/Kegiatan";
// import AddKegiatan from "./pages/Kegiatan/AddKegiatan";
// import EditKegiatan from "./pages/Kegiatan/EditKegiatan";
// import ViewKegiatan from "./pages/Kegiatan/ViewKegiatan";
export default function App() {
  return (
    <Router>
      <Routes>

        {/* Login hanya untuk guest */}
        <Route element={<GuestRoute />}>
          <Route
            path="/login"
            element={<Login />}
          />
        </Route>

        {/* Dashboard hanya untuk user login */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            
            <Route
              path="/logout"
              element={<Logout />}
            />
            <Route
              path="/basic-tables"
              element={
                <RoleRoute roles={[1]}>
                  <BasicTables />
                </RoleRoute>
              }
            />
            <Route path="/pelanggan" element={
                <RoleRoute roles={[1]}>
                  <Customer />
                </RoleRoute>
              }
            />
            <Route path="/pelanggan/tambah" element={
                <RoleRoute roles={[1]}>
                  <AddCustomer />
                </RoleRoute>
              }
            />
            <Route path="/pelanggan/edit/:id" element={
                <RoleRoute roles={[1]}>
                  <EditCustomer />
                </RoleRoute>
              }
            />
            <Route path="/pelanggan/view/:id" element={
                <RoleRoute roles={[1]}>
                  <ViewCustomer />
                </RoleRoute>
              }
            />

            {/* Paket */}
            <Route path="/paket/" element={
                <RoleRoute roles={[1]}>
                  <Paket />
                </RoleRoute>
              }
            />
             <Route path="/paket/tambah" element={
                <RoleRoute roles={[1]}>
                  <AddPaket />
                </RoleRoute>
              }
            />
            <Route path="/paket/edit/:id" element={
                <RoleRoute roles={[1]}>
                  <EditPaket />
                </RoleRoute>
              }
            />
            <Route path="/paket/view/:id" element={
                <RoleRoute roles={[1]}>
                  <ViewPaket />
                </RoleRoute>
              }
            />

            {/* Kegiatan */}
            <Route path="/kegiatan/" element={
                <RoleRoute roles={[1]}>
                  <Kegiatan />
                </RoleRoute>
              }
            />

           {/* <Route path="/kegiatan/tambah" element={
                <RoleRoute roles={[1]}>
                  <AddKegiatan />
                </RoleRoute>
              }
            />*/}

            {/*<Route path="/kegiatan/edit/:id" element={
                <RoleRoute roles={[1]}>
                  <EditKegiatan />
                </RoleRoute>
              }
            />*/}

{/*            <Route path="/kegiatan/view/:id" element={
                <RoleRoute roles={[1]}>
                  <ViewKegiatan />
                </RoleRoute>
              }
            />*/}



            {/* Admin */}
           {/* <Route path="/admin" element={
                <RoleRoute roles={[1]}>
                  <Customer />
                </RoleRoute>
              }
            />
*/}
            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/*<Route
              path="/roles"
              element={
                <RoleRoute roles={[1]}>
                  <Roles />
                </RoleRoute>
              }
            />

            <Route
              path="/permissions"
              element={
                <RoleRoute roles={[1]}>
                  <Permissions />
                </RoleRoute>
              }
            />

            <Route
              path="/role-permissions"
              element={
                <RoleRoute roles={[1]}>
                  <RolePermissions />
                </RoleRoute>
              }
            />*/}

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

          </Route>
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Router>
  );
}