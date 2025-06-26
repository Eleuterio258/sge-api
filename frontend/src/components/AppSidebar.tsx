import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLE_PERMISSIONS } from '@/types/auth';
import {
  Home,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Car,
  Calendar,
  Building,
  Link as LinkIcon
} from 'lucide-react';

const menuItems = [
  // Itens para Super Admin
  { icon: Home, label: 'Dashboard', id: 'dashboard', to: '/admin/dashboard', roles: [1] },
  { icon: Users, label: 'Estudantes', id: 'students', to: '/admin/student-managements', roles: [1] },
  { icon: Building, label: 'Gestão de Escolas', id: 'schools-management', to: '/admin/schools', roles: [1] },
  { icon: Users, label: 'Gestão de Usuários', id: 'users-management', to: '/admin/users', roles: [1] },
  { icon: LinkIcon, label: 'Atribuição Usuários-Escolas', id: 'user-school-assignment', to: '/admin/user-school-assignment', roles: [1] },
  { icon: BarChart3, label: 'Relatórios Financeiro', id: 'system-reports', to: '/admin/reports', roles: [1] },

  // Itens para Admin Local
  { icon: Home, label: 'Dashboard', id: 'dashboard', to: '/local-admin/dashboard', roles: [2] },
  { icon: Users, label: 'Estudantes', id: 'students', to: '/local-admin/students', roles: [2] },
];

interface AppSidebarProps {
  activeSection?: string;
  isCollapsed?: boolean;
}

export function AppSidebar({
  activeSection = 'dashboard',
  isCollapsed = false
}: AppSidebarProps) {
  const { user } = useAuth();
  const { canAccess } = usePermissions();

  const getFilteredMenuItems = () => {
    if (!user) return menuItems.filter(item => item.id === 'dashboard');
    return menuItems.filter(item => item.roles && item.roles.includes(user.id_tipo_utilizador));
  };

  const filteredItems = getFilteredMenuItems();

  const getUserRoleLabel = () => {
    if (!user) return '';

    switch (user.id_tipo_utilizador) {
      case 1: return 'Super Administrador';
      case 2: return 'Administrador Local';
      case 3: return 'Gestor Financeiro';
      case 4: return 'Instrutor';
      case 5: return 'Secretário';
      case 6: return 'Estudante';
      default: return user.nome_tipo_utilizador || 'Utilizador';
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-gray-500';

    switch (user.id_tipo_utilizador) {
      case 1: return 'bg-red-500'; // Super Admin
      case 2: return 'bg-blue-500'; // Admin Local
      case 3: return 'bg-green-500'; // Gestor Financeiro
      case 4: return 'bg-purple-500'; // Instrutor
      case 5: return 'bg-orange-500'; // Secretário
      case 6: return 'bg-gray-500'; // Estudante
      default: return 'bg-gray-500';
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className={`h-full w-full flex-col bg-sidebar group/sidebar-wrapper transition-all duration-300 ${isCollapsed ? "data-[state=collapsed]" : "data-[state=expanded]"}`}>
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="group-data-[collapsible=icon]:hidden">
              <h1 className="text-xl font-bold text-sidebar-foreground">ESCOLA DE CONDUÇÃO R. GARCIA</h1>
              <p className="text-sm text-sidebar-foreground/60">Sistema de Gestão</p>
              {user && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-sidebar-foreground/80">
                    {user.nome_completo}
                  </p>

                </div>
              )}
            </div>
          )}
          {isCollapsed && user && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user.nome_completo)
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2">
        <div className="relative flex w-full min-w-0 flex-col p-2">
          {!isCollapsed && (
            <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 mb-2">
              Menu Principal
            </div>
          )}

          <div className="w-full text-sm">
            <ul className="flex w-full min-w-0 flex-col gap-1">
              {/* Itens do menu filtrados por permissões */}
              {filteredItems.map((item) => (
                <li key={item.id} className="group/menu-item relative">
                  <Link
                    to={item.to || `/${item.id}`}
                    className={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${activeSection === item.id ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""} ${isCollapsed ? "!size-8 !p-2 justify-center" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`shrink-0 ${isCollapsed ? "w-4 h-4" : "w-5 h-5"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                  {/* Tooltip para modo collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md opacity-0 pointer-events-none group-hover/menu-item:opacity-100 group-hover/menu-item:pointer-events-auto transition-opacity">
                      <div className="font-medium">{item.label}</div>
                      {user && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {getUserRoleLabel()}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* User Info in Collapsed Mode */}
      {isCollapsed && user && (
        <div className="p-2">
          <div className="group/user-info relative">
            <div className="flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRoleBadgeColor()}`}>
                {getInitials(user.nome_completo)}
              </div>
            </div>

            {/* Tooltip com informações do usuário */}
            <div className="absolute left-full bottom-0 ml-2 z-50 overflow-hidden rounded-md border bg-popover p-3 text-popover-foreground shadow-md opacity-0 pointer-events-none group-hover/user-info:opacity-100 group-hover/user-info:pointer-events-auto transition-opacity min-w-[200px]">
              <div className="space-y-1">
                <div className="font-medium text-sm">{user.nome_completo}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground">{user.telefone}</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white ${getRoleBadgeColor()}`}>
                    {getUserRoleLabel()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="flex flex-col gap-2 p-4">
        {!isCollapsed && (
          <div className="space-y-1">
            <div className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
              © 2024 EscolaCondução
            </div>
            {user && (
              <div className="text-xs text-sidebar-foreground/40">
                Utilizador ID: {user.id_utilizador}
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="text-center">
            <div className="text-xs text-sidebar-foreground/60">
              2024
            </div>
          </div>
        )}
      </div>
    </div>
  );
}