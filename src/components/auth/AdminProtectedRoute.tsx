import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

interface AdminProtectedRouteProps {
  children: React.ReactElement;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!authService.isSuperAdmin(user)) {
    toast.error('Access Restricted: Only platform owner (ramtekekishor893@gmail.com) can access the Super Admin Console.', {
      icon: '🛡️',
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

