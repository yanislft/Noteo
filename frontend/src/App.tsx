import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { me } from './api/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerifyEmail from './pages/VerifyEmail';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user, hydrated } = useAuthStore();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" />;
  if (user && !user.email_verified_at) return <Navigate to="/verify-email" />;
  return <>{children}</>;
};

function App() {
  const { token, user, setUser, setHydrated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      me().then(setUser).catch(clearAuth).finally(setHydrated);
    } else {
      setHydrated();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
