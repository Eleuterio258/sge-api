// types/auth.ts
export type UserRole = 1 | 2 | 3 | 4 | 5 | 6;

export interface User {
  id_utilizador: number;
  nome_completo: string;
  email: string;
  telefone: string;
  id_tipo_utilizador: UserRole;
  ativo: number;
  data_criacao: string;
  data_atualizacao: string;
  nome_tipo_utilizador: string;
  schoolId?: string;
  avatar?: string;
  escolas_atribuidas?: Array<{
    id_escola: number;
    nome_escola: string;
    ativo: number;
  }>;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  canAccessSchool: (schoolId: string) => boolean;
  getCurrentUserSchool: () => string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isTokenValid: () => boolean;
  getCurrentUser: () => Promise<User | null>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  apiClient: any;
  error: string | null;
  isAuthenticated: boolean;
  interceptorsReady: boolean; // Added this property
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

// Mapeamento dos tipos de utilizador
export const USER_TYPE_MAPPING: Record<UserRole, string> = {
  1: 'superadmin',
  2: 'local_admin',
  3: 'financial',
  4: 'instructor',
  5: 'secretary',
  6: 'student'
};

// Mapeamento das rotas por role - Atualizado para nova estrutura
export const ROLE_ROUTES: Record<UserRole, string> = {
  1: '/admin/dashboard',
  2: '/local-admin/dashboard',
  3: '/financial/dashboard',
  4: '/instructor/dashboard',
  5: '/secretary/dashboard',
  6: '/student/dashboard'
};

// Nomes das roles em português
export const ROLE_NAMES: Record<UserRole, string> = {
  1: 'Super Administrador',
  2: 'Administrador Local',
  3: 'Gestor Financeiro',
  4: 'Instrutor',
  5: 'Secretário',
  6: 'Estudante'
};

// Permissões baseadas no ID do tipo de utilizador - Atualizadas
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  1: [ // Super Admin - Acesso total a tudo
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'schools', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'students', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'instructors', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'lessons', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'enrollments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'system', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'superadmin', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'financial', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'secretary', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'student', actions: ['create', 'read', 'update', 'delete'] },
  ],
  2: [ // Admin Local
    { resource: 'schools', actions: ['read', 'update'] },
    { resource: 'students', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'instructors', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'lessons', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'local-admin', actions: ['create', 'read', 'update', 'delete'] },
  ],
  3: [ // Gestor Financeiro
    { resource: 'schools', actions: ['read'] },
    { resource: 'students', actions: ['read'] },
    { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'financial', actions: ['create', 'read', 'update', 'delete'] },
  ],
  4: [ // Instrutor
    { resource: 'schools', actions: ['read'] },
    { resource: 'students', actions: ['read'] },
    { resource: 'lessons', actions: ['read', 'update'] },
    { resource: 'instructor', actions: ['read', 'update'] },
  ],
  5: [ // Secretário
    { resource: 'students', actions: ['create', 'read', 'update'] },
    { resource: 'lessons', actions: ['create', 'read'] },
    { resource: 'payments', actions: ['read'] },
    { resource: 'secretary', actions: ['create', 'read', 'update'] },
  ],
  6: [ // Estudante
    { resource: 'lessons', actions: ['read'] },
    { resource: 'student', actions: ['read'] },
  ],
};

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export const MOCK_SCHOOLS: School[] = [
  {
    id: 'escola-1',
    name: 'Escola de Condução Central',
    address: 'Rua Principal, 123 - Centro',
    phone: '(11) 1234-5678'
  },
  {
    id: 'escola-2',
    name: 'Escola de Condução Norte',
    address: 'Av. Norte, 456 - Zona Norte',
    phone: '(11) 9876-5432'
  }
];

// Additional interfaces for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper functions for permissions
export const hasPermission = (
  userRole: UserRole,
  resource: string,
  action: string
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  const resourcePermission = permissions.find(p => p.resource === resource);
  return resourcePermission?.actions.includes(action) || false;
};

export const canAccessResource = (
  userRole: UserRole,
  resource: string
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(p => p.resource === resource);
};

// Authentication state helpers
export const isUserAuthenticated = (user: User | null, token: string | null): boolean => {
  return !!(user && token);
};

export const getUserRoleName = (roleId: UserRole): string => {
  return ROLE_NAMES[roleId] || 'Utilizador';
};

export const getUserRoute = (roleId: UserRole): string => {
  return ROLE_ROUTES[roleId] || '/dashboard';
};