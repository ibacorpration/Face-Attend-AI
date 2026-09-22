import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/common/AdminLayout';

import LandingPage from './pages/Landing/LandingPage';
import CameraPage from './pages/Employee/Camera/CameraPage';
import AdminLogin from './pages/Admin/Login/AdminLogin';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import EmployeesPage from './pages/Admin/Employees/EmployeesPage';
import AttendancePage from './pages/Admin/Attendance/AttendancePage';

// Placeholders for remaining Admin Pages

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="reviews" element={<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">No pending reviews.</div>} />
            <Route path="messages" element={<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">No messages yet.</div>} />
            <Route path="settings" element={<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">System settings coming soon.</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
