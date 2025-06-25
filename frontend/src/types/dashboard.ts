// types/dashboard.ts
export interface DashboardStats {
  total_alunos: number;
  total_matriculas: number;
  total_parcelas_pendentes: number;
  total_pago: string;
}

export interface ProximaAula {
  id_aula: number;
  data_aula: string;
  hora_inicio: string;
  tipo_aula: string;
  nome_aluno: string;
  nome_instrutor: string;
  id_escola: string;
}

export interface AtividadeRecente {
  data_evento: string;
  tipo: string;
  mensagem: string;
  id_escola: string;
}

export interface ConquistasMes {
  aprovados: number;
  matriculas: number;
  receita: number;
}

export interface Pendencias {
  pagamentos: number;
  documentos: number;
  manutencao: number;
}

export interface Escola {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
}

export interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: string;
  bgColor: string;
} 

export interface ApiErrorResponse {
  message: string;
  error: string;
}
