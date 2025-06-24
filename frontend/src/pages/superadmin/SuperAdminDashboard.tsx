import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  GraduationCap, 
  Car, 
  TrendingUp, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Building,
  AlertCircle,
  DollarSign,
  FileText,
  Wrench
} from 'lucide-react';

interface DashboardStats {
  total_alunos: number;
  total_matriculas: number;
  total_parcelas_pendentes: number;
  total_pago: string;
}

interface ProximaAula {
  id_aula: number;
  data_aula: string;
  hora_inicio: string;
  tipo_aula: string;
  nome_aluno: string;
  nome_instrutor: string;
  id_escola: string;
}

interface AtividadeRecente {
  data_evento: string;
  tipo: string;
  mensagem: string;
  id_escola: string;
}

interface ConquistasMes {
  aprovados: number;
  matriculas: number;
  receita: number;
}

interface Pendencias {
  pagamentos: number;
  documentos: number;
  manutencao: number;
}

interface Escola {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
}

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, accessToken } = useAuth();
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  const [upcomingLessons, setUpcomingLessons] = useState<ProximaAula[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  
  const [recentActivities, setRecentActivities] = useState<AtividadeRecente[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  
  const [conquistasMes, setConquistasMes] = useState<ConquistasMes | null>(null);
  const [loadingConquistas, setLoadingConquistas] = useState(false);
  const [conquistasError, setConquistasError] = useState<string | null>(null);
  
  const [pendencias, setPendencias] = useState<Pendencias | null>(null);
  const [loadingPendencias, setLoadingPendencias] = useState(false);
  const [pendenciasError, setPendenciasError] = useState<string | null>(null);

  // State for schools data
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);

  // Create axios instance with configuration
  const createAxiosInstance = () => {
    return axios.create({
      baseURL: 'http://135.181.249.37:4000/api',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // Fetch schools data
  useEffect(() => {
    const fetchEscolas = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingEscolas(true);
        try {
          console.log('🚀 Fetching schools...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/escolas');
          console.log('✅ Schools received:', response.data);
          setEscolas(Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
          console.error('❌ Erro ao buscar escolas:', error);
          setEscolas([]);
        } finally {
          setLoadingEscolas(false);
        }
      }
    };
    
    fetchEscolas();
  }, [user, isAuthenticated, accessToken]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingStats(true);
        setStatsError(null);
        try {
          console.log('🚀 Fetching dashboard stats...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/escolas/dashboard/geral');
          console.log('✅ Dashboard stats received:', response.data);
          setDashboardStats(response.data);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar estatísticas do dashboard.';
          setStatsError(errorMessage);
          console.error('❌ Erro ao buscar estatísticas:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };
    
    fetchStats();
  }, [user, isAuthenticated, accessToken]);

  // Fetch upcoming lessons
  useEffect(() => {
    const fetchUpcomingLessons = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingLessons(true);
        setLessonsError(null);
        try {
          console.log('🚀 Fetching upcoming lessons...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/aulas/proximas');
          console.log('✅ Upcoming lessons received:', response.data);
          
          if (response.data.message === "Aula não encontrada") {
            setUpcomingLessons([]);
            setLessonsError(null);
          } else {
            setUpcomingLessons(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar próximas aulas.';
          setLessonsError(errorMessage);
          console.error('❌ Erro ao buscar próximas aulas:', error);
          setUpcomingLessons([]);
        } finally {
          setLoadingLessons(false);
        }
      }
    };
    fetchUpcomingLessons();
  }, [user, isAuthenticated, accessToken]);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingActivities(true);
        setActivitiesError(null);
        try {
          console.log('🚀 Fetching recent activities...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/escolas/atividades/recentes');
          console.log('✅ Recent activities received:', response.data);
          
          if (response.data.message) {
            setRecentActivities([]);
            setActivitiesError(null);
          } else {
            setRecentActivities(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar atividades recentes.';
          setActivitiesError(errorMessage);
          console.error('❌ Erro ao buscar atividades recentes:', error);
          setRecentActivities([]);
        } finally {
          setLoadingActivities(false);
        }
      }
    };
    fetchRecentActivities();
  }, [user, isAuthenticated, accessToken]);

  // Fetch monthly achievements
  useEffect(() => {
    const fetchConquistas = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingConquistas(true);
        setConquistasError(null);
        try {
          console.log('🚀 Fetching achievements...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/escolas/conquistas/mes');
          console.log('✅ Achievements received:', response.data);
          
          if (response.data.message) {
            setConquistasMes(null);
            setConquistasError(null);
          } else {
            setConquistasMes(response.data);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar conquistas do mês.';
          setConquistasError(errorMessage);
          console.error('❌ Erro ao buscar conquistas:', error);
          setConquistasMes(null);
        } finally {
          setLoadingConquistas(false);
        }
      }
    };
    fetchConquistas();
  }, [user, isAuthenticated, accessToken]);

  // Fetch pending items
  useEffect(() => {
    const fetchPendencias = async () => {
      if (user?.id_tipo_utilizador === 1 && isAuthenticated && accessToken) {
        setLoadingPendencias(true);
        setPendenciasError(null);
        try {
          console.log('🚀 Fetching pending items...');
          const axiosInstance = createAxiosInstance();
          const response = await axiosInstance.get('/escolas/pendencias');
          console.log('✅ Pending items received:', response.data);
          
          if (response.data.message === "Escola não encontrada") {
            setPendencias(null);
            setPendenciasError(null);
          } else {
            setPendencias(response.data);
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao buscar pendências.';
          setPendenciasError(errorMessage);
          console.error('❌ Erro ao buscar pendências:', error);
          setPendencias(null);
        } finally {
          setLoadingPendencias(false);
        }
      }
    };
    fetchPendencias();
  }, [user, isAuthenticated, accessToken]);

  // Access control for Super Admin only
  if (!user || user.id_tipo_utilizador !== 1) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Acesso Negado
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Apenas Super Administradores podem acessar este dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to get school name by ID
  const getSchoolName = (schoolId: string) => {
    const escola = escolas.find(e => e.id === schoolId);
    return escola?.nome || `Escola ID: ${schoolId}`;
  };

  // Generate stats data
  const stats = [
    {
      title: 'Total de Estudantes',
      value: dashboardStats?.total_alunos?.toString() || '0',
      icon: Users,
      trend: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total de Matrículas',
      value: dashboardStats?.total_matriculas?.toString() || '0',
      icon: GraduationCap,
      trend: '+8%',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Parcelas Pendentes',
      value: dashboardStats?.total_parcelas_pendentes?.toString() || '0',
      icon: CreditCard,
      trend: '-5%',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Pago',
      value: `MT ${dashboardStats?.total_pago || '0'}`,
      icon: DollarSign,
      trend: '+15%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getUserRoleLabel = () => {
    switch (user?.id_tipo_utilizador) {
      case 1: return 'Super Administrador';
      case 2: return 'Administrador Local';
      case 3: return 'Gestor Financeiro';
      case 4: return 'Instrutor';
      case 5: return 'Secretário';
      case 6: return 'Estudante';
      default: return 'Utilizador';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Super Admin</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Building className="w-4 h-4" />
          <span>Todas as Escolas ({escolas.length} escolas)</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <span>Bem-vindo, </span>
          <span className="font-medium text-foreground">{user?.nome_completo}</span>
          <span className="ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">
            {getUserRoleLabel()}
          </span>
        </div>

        {/* Loading States */}
        {(loadingStats || loadingEscolas) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600">
                {loadingStats && 'Carregando estatísticas...'}
                {loadingEscolas && 'Carregando escolas...'}
              </span>
            </div>
          </div>
        )}

        {statsError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-red-600">{statsError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend.startsWith('+') ? '↗' : '↘'} {stat.trend}
                </span> desde o mês passado
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Aulas */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Aulas
            </h3>
          </div>
          <div className="p-6 pt-0">
            {loadingLessons ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando próximas aulas...
              </div>
            ) : lessonsError ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {lessonsError}
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {upcomingLessons.length > 0 ? upcomingLessons.map((lesson) => (
                  <div key={lesson.id_aula} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors">
                    <div>
                      <p className="font-medium">{lesson.nome_aluno}</p>
                      <p className="text-sm text-muted-foreground">Instrutor: {lesson.nome_instrutor}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Building className="w-3 h-3" />
                        {getSchoolName(lesson.id_escola)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{lesson.hora_inicio}</p>
                      <p className="text-sm text-muted-foreground">{lesson.tipo_aula}</p>
                      <p className="text-xs text-muted-foreground">{new Date(lesson.data_aula).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Atividades Recentes
            </h3>
          </div>
          <div className="p-6 pt-0">
            {loadingActivities ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando atividades recentes...
              </div>
            ) : activitiesError ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {activitiesError}
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.mensagem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.data_evento).toLocaleString('pt-BR')}
                        </p>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-foreground">
                          {getSchoolName(activity.id_escola)}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pendências e Conquistas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendências */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Pendências
            </h3>
          </div>
          <div className="p-6 pt-0">
            {loadingPendencias ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando pendências...
              </div>
            ) : pendenciasError ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {pendenciasError}
              </div>
            ) : pendencias ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Pagamentos em atraso</span>
                  </div>
                  <span className="font-bold text-orange-600">{pendencias.pagamentos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="text-sm">Documentos vencidos</span>
                  </div>
                  <span className="font-bold text-red-600">{pendencias.documentos}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Veículos em manutenção</span>
                  </div>
                  <span className="font-bold text-yellow-600">{pendencias.manutencao}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhuma pendência encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Conquistas do Mês */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Conquistas do Mês
            </h3>
          </div>
          <div className="p-6 pt-0">
            {loadingConquistas ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Carregando conquistas...
              </div>
            ) : conquistasError ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {conquistasError}
              </div>
            ) : conquistasMes ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Estudantes aprovados</span>
                  </div>
                  <span className="font-bold text-green-600">{conquistasMes.aprovados}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Novas matrículas</span>
                  </div>
                  <span className="font-bold text-blue-600">{conquistasMes.matriculas}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Receita do mês</span>
                  </div>
                  <span className="font-bold text-purple-600">MT {conquistasMes.receita}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Nenhuma conquista registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Information */}
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
                <p className="font-medium">{user.telefone || 'Não informado'}</p>
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
}