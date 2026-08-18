// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@store/authStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, user } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (requiredRole && user?.role?.toUpperCase() !== requiredRole.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Finalized authentication logic
