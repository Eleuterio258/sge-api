// hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/types/auth';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.id_tipo_utilizador];
    const resourcePermission = permissions.find(p => p.resource === resource);
    
    return resourcePermission?.actions.includes(action) || false;
  };

  const canAccess = (resource: string): boolean => {
    return hasPermission(resource, 'read');
  };

  const canCreate = (resource: string): boolean => {
    return hasPermission(resource, 'create');
  };

  const canUpdate = (resource: string): boolean => {
    return hasPermission(resource, 'update');
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(resource, 'delete');
  };

  const getUserRoleString = (): string => {
    if (!user) return '';
    
    const roleMap: Record<number, string> = {
      1: 'superadmin',
      2: 'local_admin', 
      3: 'financial_manager',
      4: 'instructor',
      5: 'secretary',
      6: 'student'
    };
    
    return roleMap[user.id_tipo_utilizador] || '';
  };

  return {
    hasPermission,
    canAccess,
    canCreate,
    canUpdate,
    canDelete,
    getUserRoleString,
  };
}