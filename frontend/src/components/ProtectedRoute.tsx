// components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_PERMISSIONS } from '../types/auth';
 
import { useNavigation } from '../hooks/UseNavigation';
import { canAccessRoute } from '@/Utils/RoleRouting';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requiredPermission,
  redirectTo = '/unauthorized'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { navigateToLogin, navigate, pathname } = useNavigation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Se não estiver autenticado, redireciona para login
      if (!isAuthenticated || !user) {
        navigateToLogin();
        return;
      }

      let authorized = true;

      // Verifica acesso baseado em roles
      if (allowedRoles && !allowedRoles.includes(user.id_tipo_utilizador)) {
        authorized = false;
      }

      // Verifica acesso baseado em permissões
      if (requiredPermission && authorized) {
        const userPermissions = ROLE_PERMISSIONS[user.id_tipo_utilizador];
        const hasPermission = userPermissions.some(permission => 
          permission.resource === requiredPermission.resource &&
          permission.actions.includes(requiredPermission.action)
        );

        if (!hasPermission) {
          authorized = false;
        }
      }

      // Verifica se pode acessar a rota atual
      if (authorized && !canAccessRoute(user.id_tipo_utilizador, pathname)) {
        authorized = false;
      }

      if (!authorized) {
        navigate(redirectTo, { replace: true });
        return;
      }

      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, isLoading, navigateToLogin, navigate, allowedRoles, requiredPermission, redirectTo, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado ou autorizado, não renderiza nada
  if (!isAuthenticated || !user || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}