import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Users,
  GraduationCap,
  CreditCard,
  DollarSign,
  Building,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  ApiErrorResponse,
  DashboardStats,
  Escola,
  StatCard
} from '../../types/dashboard';

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, accessToken } = useAuth();

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // State for schools data
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [escolasError, setEscolasError] = useState<string | null>(null);

  // Fetch schools data
  const fetchEscolas = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;

    setLoadingEscolas(true);
    setEscolasError(null);
    
    try {
      console.log('🚀 Fetching schools...');
      const response = await axios.get('/escolas', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ Schools received:', response.data);
      setEscolas(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar escolas:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Erro ao buscar escolas.';
      setEscolasError(errorMessage);
      setEscolas([]);
    } finally {
      setLoadingEscolas(false);
    }
  }, [isAuthenticated, accessToken]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;

    setLoadingStats(true);
    setStatsError(null);
    
    try {
      console.log('🚀 Fetching dashboard stats...');
      const response = await axios.get('/escolas/dashboard/geral', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ Dashboard stats received:', response.data);
      setDashboardStats(response.data);
    } catch (error: unknown) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Erro ao buscar estatísticas do dashboard.';
      setStatsError(errorMessage);
    } finally {
      setLoadingStats(false);
    }
  }, [isAuthenticated, accessToken]);

  // Effects
  useEffect(() => {
    fetchEscolas();
  }, [fetchEscolas]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format currency
  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue || 0);
  };

  // Generate stats data
  const stats: StatCard[] = [
    {
      title: 'Total de Estudantes',
      value: dashboardStats?.total_alunos?.toLocaleString('pt-MZ') || '0',
      icon: Users,
      trend: '0%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total de Matrículas',
      value: dashboardStats?.total_matriculas?.toLocaleString('pt-MZ') || '0',
      icon: GraduationCap,
      trend: '0%',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Parcelas Pendentes',
      value: dashboardStats?.total_parcelas_pendentes?.toLocaleString('pt-MZ') || '0',
      icon: CreditCard,
      trend: '0%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Pago',
      value: `MT ${formatCurrency(dashboardStats?.total_pago || 0)}`,
      icon: DollarSign,
      trend: '0%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Retry function
  const handleRetry = () => {
    fetchStats();
    fetchEscolas();
  };

  // Loading state
  const isLoading = loadingStats || loadingEscolas;
  const hasErrors = statsError || escolasError;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Super Admin</h1>
          {hasErrors && (
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Tentar novamente"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Tentar Novamente
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Building className="w-4 h-4" />
          <span>Todas as Escolas ({escolas.length} escolas)</span>
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground">
          <span>Bem-vindo, </span>
          <span className="font-medium text-foreground">{user?.nome_completo}</span>
          <span className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">
            Super Administrador
          </span>
        </div>

        {/* Loading States */}
        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600">
                Carregando dados do dashboard...
              </span>
            </div>
          </div>
        )}

        {/* Error States */}
        {statsError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-600">Estatísticas: {statsError}</span>
              </div>
            </div>
          </div>
        )}

        {escolasError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-600">Escolas: {escolasError}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={`stat-${index}`} 
            className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-gray-500">
                  Dados atualizados
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* User Information */}
      {user && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Informações da Sessão
            </h3>
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
                <p className="font-medium">{user.telefone || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Utilizador:</span>
                <p className="font-medium">{user.nome_tipo_utilizador}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span 
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ml-1 ${
                    user.ativo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                  aria-label={`Status: ${user.ativo ? 'Ativo' : 'Inativo'}`}
                >
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Membro desde:</span>
                <p className="font-medium">
                  {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}