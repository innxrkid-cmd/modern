import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import LeavePage from './pages/LeavePage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="leave"
          element={
            <ProtectedRoute>
              <LeavePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll"
          element={
            <ProtectedRoute>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
