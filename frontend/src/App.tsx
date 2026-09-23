import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/common/AdminLayout';
import { SmoothScroll } from './components/common/SmoothScroll';
import { AnimatePresence, motion } from 'framer-motion';

import LandingPage from './pages/Landing/LandingPage';
import CameraPage from './pages/Employee/Camera/CameraPage';
import AdminLogin from './pages/Admin/Login/AdminLogin';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import EmployeesPage from './pages/Admin/Employees/EmployeesPage';
import AttendancePage from './pages/Admin/Attendance/AttendancePage';
import MessagesPage from './pages/Admin/Messages/MessagesPage';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/camera" element={<PageWrapper><CameraPage /></PageWrapper>} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
          <Route path="employees" element={<PageWrapper><EmployeesPage /></PageWrapper>} />
          <Route path="attendance" element={<PageWrapper><AttendancePage /></PageWrapper>} />
          <Route path="messages" element={<PageWrapper><MessagesPage /></PageWrapper>} />
          <Route path="settings" element={<PageWrapper><div className="bg-surface rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">System settings coming soon.</div></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <SmoothScroll>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { marginTop: '50px' },
            className: 'bg-sidebar border border-primary/50 text-white shadow-soft-lg rounded-2xl',
          }}
        />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </SmoothScroll>
  );
}

export default App;
