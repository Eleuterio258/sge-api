// hooks/useNavigation.ts
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { UserRole, ROLE_ROUTES } from '../types/auth';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToRole = useCallback((userRole: UserRole) => {
    const route = ROLE_ROUTES[userRole] || '/dashboard';
    navigate(route, { replace: true });
  }, [navigate]);

  const navigateToLogin = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  const navigateToUnauthorized = useCallback(() => {
    navigate('/unauthorized', { replace: true });
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigate,
    location,
    navigateToRole,
    navigateToLogin,
    navigateToUnauthorized,
    goBack,
    pathname: location.pathname
  };
};