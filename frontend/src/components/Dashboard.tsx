import { useAuth } from '../contexts/AuthContext';
import { MOCK_SCHOOLS } from '../types/auth';
import { 
  Users, 
  GraduationCap, 
  Car, 
  TrendingUp, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Building
} from 'lucide-react';

export const Dashboard = () => {
  const { user, getCurrentUserSchool } = useAuth();
  
  const getSchoolName = (schoolId: string) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school?.name || 'Escola não encontrada';
  };

  const currentUserSchool = getCurrentUserSchool();
  const currentSchoolName = currentUserSchool ? getSchoolName(currentUserSchool) : 'Todas as Escolas';

  const getStatsForCurrentUser = () => {
    if (user?.id_tipo_utilizador === 1) { // Super Admin
      return {
        students: '156',
        revenue: 'MT 45,230'
      };
    } else if (currentUserSchool === 'escola-1') {
      return {
        students: '89',
        revenue: 'MT 28,450'
      };
    } else if (currentUserSchool === 'escola-2') {
      return {
        students: '67',
        revenue: 'MT 16,780'
      };
    }
    return {
      students: '0',
      revenue: 'MT 0'
    };
  };

  const statsData = getStatsForCurrentUser();

  const stats = [
    {
      title: 'Total de Estudantes',
      value: statsData.students,
      icon: Users,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Receita Mensal',
      value: statsData.revenue,
      icon: TrendingUp,
      trend: '+8.5%',
      color: 'text-primary'
    }
  ];

  const getRecentActivitiesForCurrentUser = () => {
    const baseActivities = [
      { id: 1, type: 'enrollment', message: 'Nova matrícula: Maria Silva', time: '2h atrás', schoolId: 'escola-1' },
      { id: 2, type: 'payment', message: 'Pagamento recebido: João Santos', time: '4h atrás', schoolId: 'escola-1' },
      { id: 4, type: 'exam', message: 'Exame aprovado: Pedro Oliveira', time: '1d atrás', schoolId: 'escola-1' },
      { id: 5, type: 'enrollment', message: 'Nova matrícula: Carlos Norte', time: '2d atrás', schoolId: 'escola-2' },
    ];

    if (user?.id_tipo_utilizador === 1) { // Super Admin
      return baseActivities;
    }

    return baseActivities.filter(activity => activity.schoolId === currentUserSchool);
  };

  const recentActivities = getRecentActivitiesForCurrentUser();

  const getUserRoleLabel = () => {
    switch (user?.id_tipo_utilizador) {
      case 1: return 'Super Administrador';
      case 2: return 'Administrador Local';
      case 3: return 'Gestor Financeiro';
      case 5: return 'Secretário';
      case 6: return 'Estudante';
      default: return 'Utilizador';
    }
  };

  const getPendenciesForCurrentUser = () => {
    if (user?.id_tipo_utilizador === 1) { // Super Admin
      return {
        payments: 5,
        documents: 3,
        maintenance: 2
      };
    } else if (currentUserSchool === 'escola-1') {
      return {
        payments: 2,
        documents: 1,
        maintenance: 1
      };
    } else if (currentUserSchool === 'escola-2') {
      return {
        payments: 1,
        documents: 1,
        maintenance: 0
      };
    }
    return {
      payments: 0,
      documents: 0,
      maintenance: 0
    };
  };

  const getAchievementsForCurrentUser = () => {
    if (user?.id_tipo_utilizador === 1) { // Super Admin
      return {
        approved: 23,
        enrollments: 18,
        revenue: '108%'
      };
    } else if (currentUserSchool === 'escola-1') {
      return {
        approved: 8,
        enrollments: 7,
        revenue: '95%'
      };
    } else if (currentUserSchool === 'escola-2') {
      return {
        approved: 6,
        enrollments: 4,
        revenue: '112%'
      };
    }
    return {
      approved: 0,
      enrollments: 0,
      revenue: '0%'
    };
  };

  const pendencies = getPendenciesForCurrentUser();
  const achievements = getAchievementsForCurrentUser();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Building className="w-4 h-4" />
          <span>{currentSchoolName}</span>
          {user?.id_tipo_utilizador !== 1 && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground ml-2">
              {getUserRoleLabel()}
            </span>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <span>Bem-vindo, </span>
          <span className="font-medium text-foreground">{user?.nome_completo}</span>
          {user?.id_tipo_utilizador === 1 && (
            <span className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">
              {getUserRoleLabel()}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">↗ {stat.trend}</span> desde o mês passado
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Atividades Recentes</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {user?.id_tipo_utilizador === 1 && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                          {getSchoolName(activity.schoolId)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Pendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Pendências
            </h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm">Pagamentos em atraso</span>
                <span className="font-bold text-orange-600">{pendencies.payments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm">Documentos vencidos</span>
                <span className="font-bold text-red-600">{pendencies.documents}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm">Veículos em manutenção</span>
                <span className="font-bold text-yellow-600">{pendencies.maintenance}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Conquistas do Mês
            </h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Estudantes aprovados</span>
                <span className="font-bold text-green-600">{achievements.approved}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Novas matrículas</span>
                <span className="font-bold text-blue-600">{achievements.enrollments}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm">Meta de receita</span>
                <span className="font-bold text-purple-600">{achievements.revenue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações adicionais do usuário */}
      {user && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Informações da Sessão</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID do Utilizador:</span>
                <p className="font-medium">{user.id_utilizador}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <p className="font-medium">{user.telefone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Utilizador:</span>
                <p className="font-medium">{user.nome_tipo_utilizador}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ml-1 ${user.ativo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Membro desde:</span>
                <p className="font-medium">{new Date(user.data_criacao).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};