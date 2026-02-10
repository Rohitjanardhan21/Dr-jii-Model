import "./App.css";

import { lazy, useEffect, memo } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Aos from "aos";
import { Toaster } from "react-hot-toast";
// import MainHeader from "./Layout/MainHeader";
import { useDoctorAuthStore } from "./store/useDoctorAuthStore.js";
import PersonalInfo from "./components/UsedComp/PersonalInfo.js";
import AddMedicine from './screens/Patients/AddMedicine';
import MedicalRecord from "./screens/Patients/MedicalRecord";
// import PrescriptionPreview from "./screens/Patients/PrescriptionPreview";
import PrescriptionPreviewPage from "./screens/Patients/PrescriptionPreviewPage";
import RouteTransition from "./components/RouteTransition";
import LoadingBoundary from "./components/LoadingBoundary";


import Register from "./screens/Register.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import TOTPSetup from "./components/TOTP/TOTPSetup.jsx";

const AbdmLogin = lazy(() => import("./screens/AbdmLogin"));
const AbdmSignUp = lazy(() => import("./screens/AbdmSignUp"));
const AbdmTwoVerify = lazy(() => import("./screens/AbdmTwoVerify"));
const AbdmIdGenerate = lazy(() => import("./screens/AbdmIdGenerate"));
const Appointments = lazy(() => import("./screens/Appointments"));

const Campaings = lazy(() => import("./screens/Campaings"));
const Chat = lazy(() => import("./screens/Chat/Chat"));
const CreateInvoice = lazy(() => import("./screens/Invoices/CreateInvoice"));
const DoctorProfile = lazy(() => import("./screens/Doctors/DoctorProfile"));
const EditInvoice = lazy(() => import("./screens/Invoices/EditInvoice"));
const EditPayment = lazy(() => import("./screens/Payments/EditPayment"));
const EditProfile = lazy(() => import("./screens/EditProfile"));
const Facility = lazy(() => import("./screens/Facility"));
const Invoices = lazy(() => import("./screens/Invoices/Invoices"));

const Medicine = lazy(() => import("./screens/Medicine"));
const NewMedicalRecode = lazy(() => import("./screens/Patients/NewMedicalRecode"));
const NotFound = lazy(() => import("./screens/NotFound"));
const Patients = lazy(() => import("./screens/Patients/Patients"));
const PatientProfile = lazy(() => import("./screens/Patients/PatientProfile"));
const Payments = lazy(() => import("./screens/Payments/Payments"));
const Prescription = lazy(() => import("./screens/Prescription"));
const PrescriptionDetail = lazy(() => import("./screens/PrescriptionDetail"));
const PreviewInvoice = lazy(() => import("./screens/Invoices/PreviewInvoice"));
const PreviewPayment = lazy(() => import("./screens/Payments/PreviewPayment"));
const Profile = lazy(() => import("./screens/Profile/Profile"));
const Receptions = lazy(() => import("./screens/Receptions"));
const Services = lazy(() => import("./screens/Services"));
const Settings = lazy(() => import("./screens/Settings"));
const Support = lazy(() => import("./screens/Support"));
const Dashboard = lazy(() => import("./screens/Dashboard"));
const Analytics = lazy(() => import("./screens/Analytics"));
const Docares = lazy(() => import("./screens/Docares"));
const Orders = lazy(() => import("./screens/Orders"));
const OrderDetails = lazy(() => import("./screens/OrderDetails"));

const ResetPass = lazy(() => import("./components/DoctorLogin/ResetPassword.jsx"));

function App() {
 useEffect(() => {
  Aos.init({ once: true, duration: 700 });
}, []);

  const { checkDoctorAuth } = useDoctorAuthStore();

 useEffect(() => {
  requestIdleCallback
    ? requestIdleCallback(() => checkDoctorAuth())
    : setTimeout(() => checkDoctorAuth(), 0);
}, []);


  return (
    <>
      {/* Toaster */}
      <Toaster />
      {/* Routes */}
      <BrowserRouter basename="/expert">
        <LoadingBoundary>
          <RouteTransition>
            <Routes>
              {/* doctors */}
              <Route path='/' element={<ProtectedRoute element={<AbdmLogin />} flag={true} />} />
            <Route path='/signup' element={<ProtectedRoute element={<AbdmSignUp />} flag={true} />} />
            <Route path='/twoVerify' element={<ProtectedRoute element={<AbdmTwoVerify />} flag={true} />} />
            <Route path='/new-account' element={<ProtectedRoute element={<AbdmIdGenerate />} flag={true} />} />
            <Route path='/register' element={<ProtectedRoute element={<Register />} />} />
            <Route path='/registerPersonalDetail' element={<RegisterScreen />} />
            <Route path='/totp-setup' element={<TOTPSetup />} />
            {/* <Route path="/doctors" element={<Doctors />} /> */}
            <Route path='/doctor/reset-password/:id' element={<ResetPass />} />
            <Route path='/doctors/preview/:id' element={
              <ProtectedRoute>
                <DoctorProfile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route path='/profile/:slug'
              element={<RegisterScreen />}
            ///>} 
            />
            <Route path='/support' element={<ProtectedRoute element={<Support />} />} />
            {/* invoice */}
            <Route path='/invoices' element={<ProtectedRoute element={<Invoices />} />} />
            <Route path='/invoices/create' element={<ProtectedRoute element={<CreateInvoice />} />} />
            <Route path='/invoices/edit/:id' element={<ProtectedRoute element={<EditInvoice />} />} />
            <Route path='/invoices/preview/:id' element={<ProtectedRoute element={<PreviewInvoice />} />} />

            {/* payments */}
            <Route path='/payments' element={<ProtectedRoute element={<Payments />} />} />
            <Route path='/payments/edit/:id' element={<ProtectedRoute element={<EditPayment />} />} />
            <Route path='/payments/preview/:id' element={<ProtectedRoute element={<PreviewPayment />} />} />


            {/* patient */}
            <Route path='/personalinfo' element={<ProtectedRoute element={<PersonalInfo />} />} />
            <Route path='/patients' element={<ProtectedRoute element={<Patients />} />} />
            <Route path='/patients/preview/:id' element={<ProtectedRoute element={<PatientProfile />} />} />
            {/* <Route path='/patients/create' element={<ProtectedRoute element={<CreatePatient />} />} /> */}
            <Route path='/patients/visiting/:id' element={<ProtectedRoute element={<NewMedicalRecode />} />} />
            {/* reception */}
            <Route path='/receptions' element={<ProtectedRoute element={<Receptions />} />} />
            {/* others */}
            {/* <Route path="/" element={<Login />} /> */}
            {/* <Route path="/abdm-login" element={<AbdmLogin />} /> */}
            <Route path='/appointments' element={<ProtectedRoute element={<Appointments />} />} />
            <Route path='/campaigns' element={<ProtectedRoute element={<Campaings />} />} />
            <Route path='/medicine' element={<ProtectedRoute element={<Medicine />} />} />
            <Route path='/services' element={<ProtectedRoute element={<Services />} />} />
            <Route path='/settings' element={<ProtectedRoute element={<Settings />} />} />
            <Route path='/prescription' element={<ProtectedRoute element={<Prescription />} />} />
            <Route path='/prescriptiondetail' element={<ProtectedRoute element={<PrescriptionDetail />} />} />
            <Route path='/chat' element={<ProtectedRoute element={<Chat />} />} />
            <Route path='/facility' element={<ProtectedRoute element={<Facility />} />} />
            <Route path='/analytics' element={<ProtectedRoute element={<Analytics />} />} />
            <Route path='/docare' element={<ProtectedRoute element={<Docares />} />} />
            <Route path='/orders' element={<ProtectedRoute element={<Orders />} />} />
            <Route path='/orders/:orderId' element={<ProtectedRoute element={<OrderDetails />} />} />
            {/* <Route path='/patients/visiting/:id' element={<ProtectedRoute element={<NewMedicalRecode />} />} /> */}
            <Route path="/add-medicine" element={<AddMedicine />} />
            <Route path="/add-service" element={<Services />} />
            <Route path="/MedicalRecord" element={<MedicalRecord />} />
            <Route path="/prescription/preview/:recordId" element={<ProtectedRoute element={<PrescriptionPreviewPage />} />} />
            {/* <Route path='/Prescriptionpreview' element={<ProtectedRoute element={<PrescriptionPreview />} />} /> */}



            <Route path='/docprofile/:slug' element={<Profile />} />
            <Route path='/editprofile' element={<ProtectedRoute element={<EditProfile />} />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
          </RouteTransition>
        </LoadingBoundary>
      </BrowserRouter>
    </>
  );
}

const ProtectedRoute = memo(({ element, flag }) => {
  const doctor = useDoctorAuthStore(state => state.doctor);

  if (flag === undefined) {
    return doctor ? element : <Navigate to="/" />;
  }
  if (flag) {
    return doctor ? <Navigate to="/dashboard" /> : element;
  }
});



export default App;

