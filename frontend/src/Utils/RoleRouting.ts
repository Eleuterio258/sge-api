// utils/roleRouting.ts
import { UserRole, ROLE_ROUTES, ROLE_NAMES } from '@/types/auth';

export const getRoleBasedRoute = (userRole: UserRole): string => {
  return ROLE_ROUTES[userRole] || '/dashboard';
};

export const getWelcomeMessage = (userRole: UserRole): string => {
  return `Bem-vindo, ${ROLE_NAMES[userRole]}!`;
};

export const getRoleName = (userRole: UserRole): string => {
  return ROLE_NAMES[userRole] || 'Utilizador';
};

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const allowedRoute = ROLE_ROUTES[userRole];
  
  // Super admin pode acessar todas as rotas
  if (userRole === 1) return true;
  
  // Verifica se a rota é permitida para o role
  return route.startsWith(allowedRoute.split('/dashboard')[0]);
};

export const getDefaultRouteForRole = (userRole: UserRole): string => {
  return getRoleBasedRoute(userRole);
};