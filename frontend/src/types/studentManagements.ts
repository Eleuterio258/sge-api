 
export interface Parcela {
    id_parcela: number;
    id_matricula: number;
    numero_parcela: number;
    valor_devido: string;
    data_vencimento: string;
    status_parcela: string;
    vencida?: boolean;
  }
  
  export interface Pagamento {
    id_pagamento: number;
    data_pagamento: string;
    valor_pago: string;
    metodo_pagamento: string;
    observacoes: string;
  }
  
  export interface Matricula {
    id_matricula: number;
    id_aluno: number;
    id_escola: number;
    id_categoria_carta: number;
    data_matricula: string;
    data_inicio_curso: string;
    horario_inicio_curso: string;
    duracao_contrato_meses: number;
    custo_total_curso: string;
    status_matricula: string;
    data_fim_instrucao?: string;
    data_criacao: string;
    data_atualizacao: string;
    parcelas: Parcela[];
    pagamentos: Pagamento[];
    resumo_financeiro?: {
      valor_total: number;
      valor_pago: number;
      valor_pendente: number;
      percentual_pago: number;
    };
    status_parcelas?: {
      total_parcelas: number;
      parcelas_pagas: number;
      parcelas_pendentes: number;
      parcelas_parciais: number;
      parcelas_vencidas: number;
    };
  }
  
  export interface Aluno {
    id_aluno: number;
    numero_ficha: string;
    nome_completo: string;
    apelido: string;
    data_nascimento: string;
    estado_civil: string;
    nome_pai: string;
    nome_mae: string;
    local_nascimento: string;
    tipo_identificacao: string;
    numero_identificacao: string;
    pais_origem: string;
    profissao: string;
    endereco: string;
    numero_casa: string;
    telefone_principal: string;
    telefone_alternativo: string;
    email: string;
    genero: string;
    foto_url?: string;
    data_registo: string;
    data_atualizacao: string;
    matriculas?: Matricula[];
  }
  
  export interface Escola {
    id_escola: number;
    nome_escola: string;
    endereco: string;
    telefone: string;
    email: string;
  }
  
  export interface CategoriaCartaConducao {
    id_categoria: number;
    nome_categoria: string;
    descricao: string;
    preco_base: string;
  }
  
  export interface NovaMatriculaData {
    id_escola: number;
    id_categoria_carta: number;
    data_inicio_curso: string;
    horario_inicio_curso: string;
    duracao_contrato_meses: number;
    custo_total_curso: string;
    numero_parcelas: number;
    valor_primeira_parcela: number;
    observacoes?: string;
  }
  
  export interface CategoriaCartaConducaoAPI {
    id_categoria: number;
    codigo_categoria: string;
    descricao: string;
    tipo: string;
    preco: string;
  }
  
  export interface DetalhesPagamento {
    matricula_id: number;
    parcela_numero: number;
    valor_pago: number | string;
    metodo_pagamento: string;
    status_anterior: string;
    status_atual: string;
    data_pagamento: string;
    registado_por: number;
  }