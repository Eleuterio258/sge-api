import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
 
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface Parcela {
  id_parcela: number;
  id_matricula: number;
  numero_parcela: number;
  valor_devido: string;
  data_vencimento: string;
  status_parcela: string;
  vencida?: boolean;
}

interface Pagamento {
  id_pagamento: number;
  data_pagamento: string;
  valor_pago: string;
  metodo_pagamento: string;
  observacoes: string;
}

interface Matricula {
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

interface Aluno {
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

interface Escola {
  id_escola: number;
  nome_escola: string;
  endereco: string;
  telefone: string;
  email: string;
}

interface CategoriaCartaConducao {
  id_categoria: number;
  nome_categoria: string;
  descricao: string;
  preco_base: string;
}

interface NovaMatriculaData {
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

interface CategoriaCartaConducaoAPI {
  id_categoria: number;
  codigo_categoria: string;
  descricao: string;
  tipo: string;
  preco: string;
}

interface DetalhesPagamento {
  matricula_id: number;
  parcela_numero: number;
  valor_pago: number | string;
  metodo_pagamento: string;
  status_anterior: string;
  status_atual: string;
  data_pagamento: string;
  registado_por: number;
}

const API_URL = "http://localhost:4000/api/alunos";
const MATRICULAS_API_URL = "http://localhost:4000/api/matriculas";
const ESCOLAS_API_URL = "http://localhost:4000/api/escolas";
const CATEGORIAS_API_URL = "http://localhost:4000/api/categorias-carta";

const StudentManagementsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { accessToken, isTokenValid } = useAuth();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCartaConducao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatriculaForm, setShowMatriculaForm] = useState<boolean>(false);
  const [submittingMatricula, setSubmittingMatricula] = useState<boolean>(false);
  
  const [novaMatricula, setNovaMatricula] = useState<NovaMatriculaData>({
    id_escola: 0,
    id_categoria_carta: 0,
    data_inicio_curso: '',
    horario_inicio_curso: '08:00',
    duracao_contrato_meses: 3,
    custo_total_curso: '',
    numero_parcelas: 1,
    valor_primeira_parcela: 0,
    observacoes: ''
  });

  const [parcelaParaPagar, setParcelaParaPagar] = useState<Parcela | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [detalhesPagamento, setDetalhesPagamento] = useState<DetalhesPagamento | null>(null);

  useEffect(() => {
    if (!accessToken || !isTokenValid()) {
      setError("Token de acesso inválido ou expirado. Faça login novamente.");
      setLoading(false);
      return;
    }

    if (!id) {
      setError("ID do aluno não fornecido.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar detalhes do aluno
        const alunoResponse = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAluno(alunoResponse.data);

        // Buscar matrículas do aluno
        try {
          const matriculasResponse = await axios.get(`${MATRICULAS_API_URL}/aluno/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          // Garantir que cada parcela tem o id_matricula
          const matriculasComIdNasParcelas = (matriculasResponse.data || []).map((matricula: Matricula) => ({
            ...matricula,
            parcelas: matricula.parcelas.map((parcela: any) => ({
              ...parcela,
              id_matricula: matricula.id_matricula
            }))
          }));
          
          setMatriculas(matriculasComIdNasParcelas);
        } catch (matriculasError: unknown) {
          if (axios.isAxiosError(matriculasError) && matriculasError.response?.status === 404) {
            setMatriculas([]);
          } else {
            throw matriculasError;
          }
        }

        // Buscar escolas e categorias para o formulário de matrícula
        const [escolasResponse, categoriasResponse] = await Promise.all([
          axios.get(ESCOLAS_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(CATEGORIAS_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        setEscolas(escolasResponse.data || []);
        setCategorias(
          ((categoriasResponse.data || []) as CategoriaCartaConducaoAPI[]).map((cat) => ({
            id_categoria: cat.id_categoria,
            nome_categoria: cat.codigo_categoria,
            descricao: cat.descricao,
            preco_base: cat.preco,
          }))
        );

      } catch (err: unknown) {
        console.error("Erro ao buscar dados:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Token de acesso expirado. Faça login novamente.");
          } else if (err.response?.status === 404) {
            setError("Aluno não encontrado.");
          } else {
            setError("Erro ao buscar detalhes do aluno. Tente novamente.");
          }
        } else {
          setError("Erro ao buscar detalhes do aluno. Tente novamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, accessToken, isTokenValid]);

  const handleCategoriaChange = (categoriaId: number) => {
    const categoria = categorias.find(c => c.id_categoria === categoriaId);
    if (categoria) {
      setNovaMatricula(prev => ({
        ...prev,
        id_categoria_carta: categoriaId,
        custo_total_curso: categoria.preco_base,
        valor_primeira_parcela: parseFloat(categoria.preco_base)
      }));
    }
  };

  const handleSubmitMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aluno) return;

    setSubmittingMatricula(true);
    
    try {
      const matriculaData = {
        id_aluno: aluno.id_aluno,
        ...novaMatricula
      };

      await axios.post(MATRICULAS_API_URL, matriculaData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Recarregar as matrículas
      const matriculasResponse = await axios.get(`${MATRICULAS_API_URL}/aluno/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      // Garantir que cada parcela tem o id_matricula
      const matriculasComIdNasParcelas = (matriculasResponse.data || []).map((matricula: Matricula) => ({
        ...matricula,
        parcelas: matricula.parcelas.map((parcela: any) => ({
          ...parcela,
          id_matricula: matricula.id_matricula
        }))
      }));
      
      setMatriculas(matriculasComIdNasParcelas);

      // Resetar formulário
      setNovaMatricula({
        id_escola: 0,
        id_categoria_carta: 0,
        data_inicio_curso: '',
        horario_inicio_curso: '08:00',
        duracao_contrato_meses: 3,
        custo_total_curso: '',
        numero_parcelas: 1,
        valor_primeira_parcela: 0,
        observacoes: ''
      });

      setShowMatriculaForm(false);
      alert('Matrícula criada com sucesso!');

    } catch (err: unknown) {
      console.error("Erro ao criar matrícula:", err);
      alert('Erro ao criar matrícula. Tente novamente.');
    } finally {
      setSubmittingMatricula(false);
    }
  };

  const handlePagarParcela = (parcela: Parcela, matriculaId: number) => {
    console.log('Parcela selecionada:', parcela);
    console.log('ID da matrícula:', matriculaId);
    
    const parcelaComMatricula = {
      ...parcela,
      id_matricula: matriculaId
    };
    
    console.log('Parcela com matrícula:', parcelaComMatricula);
    setParcelaParaPagar(parcelaComMatricula);
  };

  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaParaPagar) return;
    
    // Debug - verificar os dados antes de enviar
    const dadosPagamento = {
      id_parcela: parcelaParaPagar.id_parcela,
      id_matricula: parcelaParaPagar.id_matricula,
      valor_pago: parseFloat(parcelaParaPagar.valor_devido),
      metodo_pagamento: metodoPagamento,
      observacoes: observacoesPagamento,
    };
    
    console.log('Dados do pagamento a serem enviados:', dadosPagamento);
    
    // Validação extra
    if (!dadosPagamento.id_matricula || !dadosPagamento.id_parcela || !dadosPagamento.metodo_pagamento) {
      alert('Dados incompletos para o pagamento. Verifique os campos obrigatórios.');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:4000/api/pagamentos', dadosPagamento, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setDetalhesPagamento(response.data.detalhes);
      setParcelaParaPagar(null);
      setMetodoPagamento('');
      setObservacoesPagamento('');
      
      // Refresh the matriculas data to show updated payment status
      const matriculasResponse = await axios.get(`${MATRICULAS_API_URL}/aluno/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      // Garantir que cada parcela tem o id_matricula
      const matriculasComIdNasParcelas = (matriculasResponse.data || []).map((matricula: Matricula) => ({
        ...matricula,
        parcelas: matricula.parcelas.map((parcela: any) => ({
          ...parcela,
          id_matricula: matricula.id_matricula
        }))
      }));
      
      setMatriculas(matriculasComIdNasParcelas);
      
      alert('Pagamento registrado com sucesso!');
      
    } catch (err: unknown) {
      console.error('Erro ao registrar pagamento:', err);
      if (axios.isAxiosError(err)) {
        console.error('Resposta do erro:', err.response?.data);
        alert(`Erro ao registrar pagamento: ${err.response?.data?.message || err.message}`);
      } else {
        alert('Erro ao registrar pagamento. Tente novamente.');
      }
    }
  };

  const formatCurrency = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null || value === "") return "MZN 0,00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "MZN 0,00";
    return numValue.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paga':
        return 'text-green-600 bg-green-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'vencida':
        return 'text-red-600 bg-red-100';
      case 'ativa':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando detalhes do aluno...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Aluno não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalhes do Aluno</h1>
        <p className="text-gray-600">Ficha: {aluno.numero_ficha}</p>
      </div>

      {/* Informações do Aluno */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {aluno.foto_url && (
            <div className="flex-shrink-0">
              <img 
                src={aluno.foto_url} 
                alt={aluno.nome_completo} 
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Informações Pessoais</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Nome:</span> {aluno.nome_completo}</p>
                <p><span className="font-semibold">Apelido:</span> {aluno.apelido}</p>
                <p><span className="font-semibold">Data de Nascimento:</span> {formatDate(aluno.data_nascimento)}</p>
                <p><span className="font-semibold">Gênero:</span> {aluno.genero}</p>
                <p><span className="font-semibold">Estado Civil:</span> {aluno.estado_civil}</p>
                <p><span className="font-semibold">Profissão:</span> {aluno.profissao}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Contato e Identificação</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Email:</span> {aluno.email}</p>
                <p><span className="font-semibold">Telefone:</span> {aluno.telefone_principal}</p>
                {aluno.telefone_alternativo && (
                  <p><span className="font-semibold">Tel. Alternativo:</span> {aluno.telefone_alternativo}</p>
                )}
                <p><span className="font-semibold">Endereço:</span> {aluno.endereco}, {aluno.numero_casa}</p>
                <p><span className="font-semibold">Identificação:</span> {aluno.tipo_identificacao} - {aluno.numero_identificacao}</p>
                <p><span className="font-semibold">País de Origem:</span> {aluno.pais_origem}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Informações Familiares</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <p><span className="font-semibold">Local de Nascimento:</span> {aluno.local_nascimento}</p>
            <p><span className="font-semibold">Nome do Pai:</span> {aluno.nome_pai}</p>
            <p><span className="font-semibold">Nome da Mãe:</span> {aluno.nome_mae}</p>
          </div>
        </div>
      </div>

      {/* Matrículas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Matrículas</h2>
          <button
            onClick={() => setShowMatriculaForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Nova Matrícula
          </button>
        </div>

        {/* Formulário de Nova Matrícula */}
        {showMatriculaForm && (
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Nova Matrícula</h3>
            <form onSubmit={handleSubmitMatricula} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escola
                  </label>
                  <select
                    value={novaMatricula.id_escola}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, id_escola: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={0}>Selecione uma escola</option>
                    {escolas.map(escola => (
                      <option key={escola.id_escola} value={escola.id_escola}>
                        {escola.nome_escola}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria da Carta
                  </label>
                  <select
                    value={novaMatricula.id_categoria_carta}
                    onChange={(e) => handleCategoriaChange(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={0}>Selecione uma categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nome_categoria} - {formatCurrency(categoria.preco_base)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início do Curso
                  </label>
                  <input
                    type="date"
                    value={novaMatricula.data_inicio_curso}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, data_inicio_curso: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={novaMatricula.horario_inicio_curso}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, horario_inicio_curso: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (meses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={novaMatricula.duracao_contrato_meses}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, duracao_contrato_meses: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaMatricula.custo_total_curso}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, custo_total_curso: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={novaMatricula.numero_parcelas}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, numero_parcelas: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Primeira Parcela
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaMatricula.valor_primeira_parcela}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, valor_primeira_parcela: parseFloat(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={novaMatricula.observacoes}
                  onChange={(e) => setNovaMatricula(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submittingMatricula}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submittingMatricula ? 'Criando...' : 'Criar Matrícula'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMatriculaForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        
        {!Array.isArray(matriculas) || matriculas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-4">Nenhuma matrícula encontrada para este aluno.</p>
            <p className="text-gray-400">Clique em "Nova Matrícula" para começar.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {matriculas.map((matricula) => (
              <div key={matricula.id_matricula} className="border border-gray-200 rounded-lg p-6">
                {/* Informações da Matrícula */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Matrícula #{matricula.id_matricula}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(matricula.status_matricula)}`}>
                      {matricula.status_matricula}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <p><span className="font-semibold">Data Matrícula:</span> {formatDate(matricula.data_matricula)}</p>
                    <p><span className="font-semibold">Início do Curso:</span> {formatDate(matricula.data_inicio_curso)}</p>
                    <p><span className="font-semibold">Horário:</span> {matricula.horario_inicio_curso}</p>
                   <p><span className="font-semibold">Duração:</span> {matricula.duracao_contrato_meses} meses</p>
                 </div>
                 
                 <div className="mt-4">
                   <p><span className="font-semibold">Custo Total:</span> {formatCurrency(matricula.custo_total_curso)}</p>
                 </div>
               </div>

               {/* Resumo Financeiro */}
               {matricula.resumo_financeiro && (
                 <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                   <h4 className="font-semibold mb-3 text-blue-800">Resumo Financeiro</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                       <p className="text-sm text-gray-600">Valor Total</p>
                       <p className="font-semibold">{formatCurrency(matricula.resumo_financeiro.valor_total)}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Valor Pago</p>
                       <p className="font-semibold text-green-600">{formatCurrency(matricula.resumo_financeiro.valor_pago)}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Valor Pendente</p>
                       <p className="font-semibold text-red-600">{formatCurrency(matricula.resumo_financeiro.valor_pendente)}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">% Pago</p>
                       <p className="font-semibold">{matricula.resumo_financeiro.percentual_pago}%</p>
                     </div>
                   </div>
                 </div>
               )}

               {/* Status das Parcelas */}
               {matricula.status_parcelas && (
                 <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                   <h4 className="font-semibold mb-3 text-gray-800">Status das Parcelas</h4>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     <div>
                       <p className="text-sm text-gray-600">Total</p>
                       <p className="font-semibold">{matricula.status_parcelas.total_parcelas}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Pagas</p>
                       <p className="font-semibold text-green-600">{matricula.status_parcelas.parcelas_pagas}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Pendentes</p>
                       <p className="font-semibold text-yellow-600">{matricula.status_parcelas.parcelas_pendentes}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Parciais</p>
                       <p className="font-semibold text-blue-600">{matricula.status_parcelas.parcelas_parciais}</p>
                     </div>
                     <div>
                       <p className="text-sm text-gray-600">Vencidas</p>
                       <p className="font-semibold text-red-600">{matricula.status_parcelas.parcelas_vencidas}</p>
                     </div>
                   </div>
                 </div>
               )}

               {/* Tabela de Parcelas */}
               <div className="mb-6">
                 <h4 className="font-semibold mb-3 text-gray-800">Parcelas</h4>
                 {matricula.parcelas.length === 0 ? (
                   <p className="text-gray-500">Nenhuma parcela encontrada.</p>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="min-w-full border border-gray-200 rounded-lg">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Nº</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Valor Devido</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Vencimento</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Status</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Ações</th>
                         </tr>
                       </thead>
                       <tbody>
                         {matricula.parcelas.map((parcela) => (
                           <tr key={parcela.id_parcela} className="hover:bg-gray-50">
                             <td className="border-b border-gray-100 px-4 py-3">{parcela.numero_parcela}</td>
                             <td className="border-b border-gray-100 px-4 py-3">{formatCurrency(parcela.valor_devido)}</td>
                             <td className="border-b border-gray-100 px-4 py-3">{formatDate(parcela.data_vencimento)}</td>
                             <td className="border-b border-gray-100 px-4 py-3">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status_parcela)}`}>
                                 {parcela.status_parcela}
                               </span>
                             </td>
                             <td className="border-b border-gray-100 px-4 py-3">
                               {parcela.status_parcela.toLowerCase() !== "paga" && (
                                 <button
                                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                                   onClick={() => handlePagarParcela(parcela, matricula.id_matricula)}
                                 >
                                   Pagar
                                 </button>
                               )}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>

               {/* Tabela de Pagamentos */}
               <div>
                 <h4 className="font-semibold mb-3 text-gray-800">Histórico de Pagamentos</h4>
                 {matricula.pagamentos.length === 0 ? (
                   <p className="text-gray-500">Nenhum pagamento registrado.</p>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="min-w-full border border-gray-200 rounded-lg">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Data</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Valor Pago</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Método</th>
                           <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-700">Observações</th>
                         </tr>
                       </thead>
                       <tbody>
                         {matricula.pagamentos.map((pagamento) => (
                           <tr key={pagamento.id_pagamento} className="hover:bg-gray-50">
                             <td className="border-b border-gray-100 px-4 py-3">{formatDate(pagamento.data_pagamento)}</td>
                             <td className="border-b border-gray-100 px-4 py-3 font-medium text-green-600">
                               {formatCurrency(pagamento.valor_pago)}
                             </td>
                             <td className="border-b border-gray-100 px-4 py-3">{pagamento.metodo_pagamento}</td>
                             <td className="border-b border-gray-100 px-4 py-3">{pagamento.observacoes}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
       )}
     </div>

     {/* Modal de Pagamento */}
     {parcelaParaPagar && (
       <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
           <h3 className="text-lg font-bold mb-4">Pagar Parcela #{parcelaParaPagar.numero_parcela}</h3>
           <form onSubmit={handleSubmitPagamento}>
             <div className="mb-4">
               <label className="block mb-1 font-medium">Valor a pagar</label>
               <input
                 type="text"
                 className="w-full border p-2 rounded bg-gray-100"
                 value={formatCurrency(parcelaParaPagar.valor_devido)}
                 readOnly
               />
             </div>
             <div className="mb-4">
               <label className="block mb-1 font-medium">Método de pagamento</label>
               <select
                 className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                 value={metodoPagamento}
                 onChange={e => setMetodoPagamento(e.target.value)}
                 required
               >
                 <option value="">Selecione o método</option>
                 <option value="mpesa">Mpesa</option>
                 <option value="dinheiro">Dinheiro</option>
                 <option value="banco">Transferência Bancária</option>
               </select>
             </div>
             <div className="mb-6">
               <label className="block mb-1 font-medium">Observações</label>
               <textarea
                 className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                 value={observacoesPagamento}
                 onChange={e => setObservacoesPagamento(e.target.value)}
                 rows={3}
                 placeholder="Informações adicionais sobre o pagamento..."
               />
             </div>
             <div className="flex gap-3 justify-end">
               <button 
                 type="button" 
                 className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors" 
                 onClick={() => {
                   setParcelaParaPagar(null);
                   setMetodoPagamento('');
                   setObservacoesPagamento('');
                 }}
               >
                 Cancelar
               </button>
               <button 
                 type="submit" 
                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                 disabled={!metodoPagamento}
               >
                 Confirmar Pagamento
               </button>
             </div>
           </form>
         </div>
       </div>
     )}

     {/* Modal de Sucesso do Pagamento */}
     {detalhesPagamento && (
       <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
           <div className="text-center mb-4">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <h3 className="text-xl font-bold text-green-600 mb-2">Pagamento Registrado!</h3>
           </div>
           
           <div className="bg-gray-50 p-4 rounded-lg mb-6">
             <div className="grid grid-cols-2 gap-3 text-sm">
               <div><span className="font-semibold">Matrícula:</span> #{detalhesPagamento.matricula_id}</div>
               <div><span className="font-semibold">Parcela:</span> #{detalhesPagamento.parcela_numero}</div>
               <div><span className="font-semibold">Valor:</span> {formatCurrency(detalhesPagamento.valor_pago)}</div>
               <div><span className="font-semibold">Método:</span> {detalhesPagamento.metodo_pagamento}</div>
               <div><span className="font-semibold">Status:</span> 
                 <span className="text-green-600 font-medium"> {detalhesPagamento.status_atual}</span>
               </div>
               <div><span className="font-semibold">Data:</span> {detalhesPagamento.data_pagamento}</div>
             </div>
           </div>
           
           <button
             className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
             onClick={() => setDetalhesPagamento(null)}
           >
             Fechar
           </button>
         </div>
       </div>
     )}
   </div>
 );
};

export default StudentManagementsDetails;