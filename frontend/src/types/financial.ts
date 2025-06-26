export interface Aluno {
  id_aluno: number;
  nome_completo: string;
  numero_ficha: string;
  telefone_principal: string;
  email?: string;
  id_escola: number;
  nome_escola?: string;
  matriculas: Matricula[];
}

export interface Matricula {
  id_matricula: number;
  id_aluno: number;
  id_escola: number;
  id_categoria_carta: number;
  custo_total_curso: string;
  numero_parcelas: number;
  data_matricula: string;
  status_matricula: string;
  parcelas: Parcela[];
  pagamentos: Pagamento[];
  resumo_financeiro?: ResumoFinanceiro;
}

export interface Parcela {
  id_parcela: number;
  id_matricula: number;
  numero_parcela: number;
  valor_devido: string;
  data_vencimento: string;
  status_parcela: string;
}

export interface Pagamento {
  id_pagamento: number;
  id_matricula: number;
  id_parcela: number;
  valor_pago: string;
  metodo_pagamento: string;
  data_pagamento: string;
  observacoes?: string;
}

export interface ResumoFinanceiro {
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  percentual_pago: number;
}

export interface EstatisticasFinanceiras {
  total_alunos: number;
  alunos_com_dividas: number;
  valor_total_devido: number;
  valor_total_recebido: number;
  percentual_recebido: number;
  parcelas_vencidas: number;
  parcelas_pendentes: number;
}

export interface FiltrosFinanceiros {
  escola: string;
  status: string;
  diasVencimento: string;
}

export interface RelatorioFinanceiro {
  nome: string;
  numero_ficha: string;
  telefone: string;
  email: string;
  escola: string;
  total_devido: string;
  parcelas_pendentes: number;
} 