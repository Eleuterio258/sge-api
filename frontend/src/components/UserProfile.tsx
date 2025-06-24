// components/UserProfile.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_SCHOOLS } from '@/types/auth';
import { LogOut, Settings, User, Building, ChevronDown } from 'lucide-react';

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, getCurrentUserSchool } = useAuth();

  if (!user) return null;

  const getRoleBadgeColor = (roleId: number) => {
    switch (roleId) {
      case 1: // Super Admin
        return 'bg-red-500 text-white';
      case 2: // Admin Local
        return 'bg-blue-500 text-white';
      case 3: // Gestor Financeiro
        return 'bg-green-500 text-white';
      case 4: // Instrutor
        return 'bg-purple-500 text-white';
      case 5: // Secretário
        return 'bg-orange-500 text-white';
      case 6: // Estudante
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSchoolName = (schoolId: string) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school?.name || 'Escola não encontrada';
  };

  const currentUserSchool = getCurrentUserSchool();

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 relative rounded-full"
      >
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.nome_completo)
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[16rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-sm font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.nome_completo}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.telefone}
                </p>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit mt-1 ${getRoleBadgeColor(user.id_tipo_utilizador)}`}>
                  {user.nome_tipo_utilizador}
                </span>
                {currentUserSchool && (
                  <div className="flex items-center gap-1 mt-2 p-2 bg-muted rounded">
                    <Building className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {getSchoolName(currentUserSchool)}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Status: {user.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </button>
            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </button>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button 
              onClick={logout}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}