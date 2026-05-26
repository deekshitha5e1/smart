import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import DashboardLayout from './components/DashboardLayout';

// Patient Pages
import PatientAppointments from './pages/patient/Appointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import Prescriptions from './pages/patient/Prescriptions';
import AIChecker from './pages/patient/AIChecker';

// Doctor Pages
import AcceptAppointment from './pages/doctor/AcceptAppointment';
import TotalPatients from './pages/doctor/TotalPatients';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';
import ManagePrescriptions from './pages/doctor/ManagePrescriptions';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="/doctor" element={<DashboardLayout role="doctor"><DoctorDashboard /></DashboardLayout>} />
      <Route path="/doctor/accept-appointment" element={<DashboardLayout role="doctor"><AcceptAppointment /></DashboardLayout>} />
      <Route path="/doctor/patients" element={<DashboardLayout role="doctor"><TotalPatients /></DashboardLayout>} />
      <Route path="/doctor/schedule" element={<DashboardLayout role="doctor"><DoctorSchedule /></DashboardLayout>} />
      <Route path="/doctor/profile" element={<DashboardLayout role="doctor"><DoctorProfile /></DashboardLayout>} />
      <Route path="/doctor/prescriptions" element={<DashboardLayout role="doctor"><ManagePrescriptions /></DashboardLayout>} />
      
      <Route path="/patient" element={<DashboardLayout role="patient"><PatientDashboard /></DashboardLayout>} />
      <Route path="/patient/appointments" element={<DashboardLayout role="patient"><PatientAppointments /></DashboardLayout>} />
      <Route path="/patient/records" element={<DashboardLayout role="patient"><MedicalRecords /></DashboardLayout>} />
      <Route path="/patient/prescriptions" element={<DashboardLayout role="patient"><Prescriptions /></DashboardLayout>} />
      <Route path="/patient/ai-checker" element={<DashboardLayout role="patient"><AIChecker /></DashboardLayout>} />
    </Routes>
  );
}

export default App;
