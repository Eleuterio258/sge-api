export interface Student {
  id: string;
  id_aluno?: number; // compatibilidade backend
  id_escola?: number; // compatibilidade backend
  numeroFicha: string;
  
  // Dados Pessoais
  nomeCompleto: string;
  dataNascimento: string;
  estadoCivil: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
  sexo: 'Masculino' | 'Feminino';
  email: string;
  
  // Identificação
  tipoIdentificacao: 'Bilhete de Identidade' | 'Passaporte' | 'DIRE';
  numeroIdentificacao: string;
  paisOrigem: string;
  classeCartao: string;
  categoriaCartao: string;
  
  // Contactos
  contactoPrincipal: string;
  contactoAlternativo?: string;
  profissao: string;
  
  // Endereço
  endereco: string;
  escola: string;
  provincia: string;
  distrito: string;
  
  // Datas e Status
  dataRegisto: string;
  dataMatricula: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Completed';
  progresso: number;
  categoria: string;
  
  // Campos adicionais para compatibilidade
  schoolId: string;
  avatar?: string;
}

export interface StudentFormData extends Omit<Student, 'id' | 'numeroFicha' | 'dataRegisto'> {}
