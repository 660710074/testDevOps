import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import Spinner from './components/Spinner';

// Protected route — redirect ถ้ายังไม่ login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Public route — redirect ถ้า login แล้ว
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
      <Route path="/tasks" element={
        <PrivateRoute><TasksPage /></PrivateRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <p className="text-gray-500 mt-2">Page not found</p>
            <a href="/dashboard" className="btn-primary mt-4 inline-flex">Go Home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
