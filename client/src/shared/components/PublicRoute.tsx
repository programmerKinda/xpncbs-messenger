import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/controllers/authController';

const PublicRoute = () => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading,
  );

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;