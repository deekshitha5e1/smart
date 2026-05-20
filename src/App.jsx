import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

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

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/doctor/accept-appointment" element={<AcceptAppointment />} />
      <Route path="/doctor/patients" element={<TotalPatients />} />
      <Route path="/doctor/schedule" element={<DoctorSchedule />} />
      <Route path="/doctor/profile" element={<DoctorProfile />} />
      
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/patient/appointments" element={<PatientAppointments />} />
      <Route path="/patient/records" element={<MedicalRecords />} />
      <Route path="/patient/prescriptions" element={<Prescriptions />} />
      <Route path="/patient/ai-checker" element={<AIChecker />} />
    </Routes>
  );
}

export default App;
