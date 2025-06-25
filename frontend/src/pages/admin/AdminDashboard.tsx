import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { MOCK_SCHOOLS } from '@/types/auth';
import { 
  Users, 
  TrendingUp, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Building
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, getCurrentUserSchool, apiClient } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const getSchoolName = (schoolId: string) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school?.name || 'Escola não encontrada';
  };

  const currentUserSchool = getCurrentUserSchool();
  const currentSchoolName = currentUserSchool ? getSchoolName(currentUserSchool) : 'Todas as Escolas';

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id_tipo_utilizador === 1) {
        setLoadingStats(true);
        setStatsError(null);
        try {
          const response = await apiClient.get('/escolas/dashboard/geral');
          setDashboardStats(response.data);
        } catch (err: any) {
          setStatsError('Erro ao buscar estatísticas reais do dashboard.');
        } finally {
          setLoadingStats(false);
        }
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
              <stat.icon className={`