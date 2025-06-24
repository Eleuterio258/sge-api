// types/instructor.ts
export interface Instrutor {
  id_instrutor: number;
  id_utilizador: number;
  nome_completo: string;
  email: string;
  telefone: string;
  cnh: string | null;
  categoria_cnh: string | null;
  data_nascimento: string | null;
  id_escola: number | null;
  id_tipo_utilizador: number;
}

export interface CreateInstrutorRequest {
  id_utilizador: number;
  cnh?: string;
  categoria_cnh?: string;
  data_nascimento?: string;
  id_escola: number;
}

export interface UpdateInstrutorRequest {
  cnh?: string;
  categoria_cnh?: string;
  data_nascimento?: string;
  id_escola?: number;
} 