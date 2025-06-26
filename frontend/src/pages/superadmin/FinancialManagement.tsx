import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle, DollarSign, TrendingUp, Users, Calendar, Filter, Download, Eye } from "lucide-react";
import axios from "axios";

interface Aluno {
  id_aluno: number;
  nome_completo: string;
  numero_ficha: string;
  telefone_principal: string;
  email?: string;
  id_escola: number;
  nome_escola?: string;
  matriculas: Matricula[];
}

interface Matricula {
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

interface Parcela {
  id_parcela: number;
  id_matricula: number;
  numero_parcela: number;
  valor_devido: string;
  data_vencimento: string;
  status_parcela: string;
}

interface Pagamento {
  id_pagamento: number;
  id_matricula: number;
  id_parcela: number;
  valor_pago: string;
  metodo_pagamento: string;
  data_pagamento: string;
  observacoes?: string;
}

interface ResumoFinanceiro {
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  percentual_pago: number;
}

interface EstatisticasFinanceiras {
  total_alunos: number;
  alunos_com_dividas: number;
  valor_total_devido: number;
  valor_total_recebido: number;
  percentual_recebido: number;
  parcelas_vencidas: number;
  parcelas_pendentes: number;
}

const FinancialManagement: React.FC = () => {
  const { user } = useAuth();
  const [alunosComDividas, setAlunosComDividas] = useState<Aluno[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFinanceiras | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    escola: "",
    status: "",
    diasVencimento: ""
  });
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

  // Bloqueio de acesso para não Super Admin
  if (!user || user.id_tipo_utilizador !== 1) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro de Acesso
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem acessar relatórios do sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [alunosResponse, estatisticasResponse] = await Promise.all([
        axios.get('http://18.206.244.149:4000/api/alunos/dividas', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://18.206.244.149:4000/api/dashboard/payment-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setAlunosComDividas(alunosResponse.data);
      calcularEstatisticas(alunosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (alunos: Aluno[]) => {
    let totalDevido = 0;
    let totalRecebido = 0;
    let parcelasVencidas = 0;
    let parcelasPendentes = 0;
    const hoje = new Date();

    alunos.forEach(aluno => {
      aluno.matriculas.forEach(matricula => {
        matricula.parcelas.forEach(parcela => {
          const valorDevido = parseFloat(parcela.valor_devido);
          totalDevido += valorDevido;

          if (parcela.status_parcela === 'Paga') {
            totalRecebido += valorDevido;
          } else {
            parcelasPendentes++;
            const dataVencimento = new Date(parcela.data_vencimento);
            if (dataVencimento < hoje) {
              parcelasVencidas++;
            }
          }
        });
      });
    });

    setEstatisticas({
      total_alunos: alunos.length,
      alunos_com_dividas: alunos.length,
      valor_total_devido: totalDevido,
      valor_total_recebido: totalRecebido,
      percentual_recebido: totalDevido > 0 ? (totalRecebido / totalDevido) * 100 : 0,
      parcelas_vencidas: parcelasVencidas,
      parcelas_pendentes: parcelasPendentes
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-MZ');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Paga':
        return 'text-green-600 bg-green-100';
      case 'Pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Vencida':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filtrarAlunos = () => {
    let alunosFiltrados = alunosComDividas;

    if (filtros.escola) {
      alunosFiltrados = alunosFiltrados.filter(aluno => 
        aluno.nome_escola?.toLowerCase().includes(filtros.escola.toLowerCase())
      );
    }

    if (filtros.status) {
      alunosFiltrados = alunosFiltrados.filter(aluno => {
        return aluno.matriculas.some(matricula => 
          matricula.parcelas.some(parcela => parcela.status_parcela === filtros.status)
        );
      });
    }

    if (filtros.diasVencimento) {
      const hoje = new Date();
      const diasLimite = parseInt(filtros.diasVencimento);
      
      alunosFiltrados = alunosFiltrados.filter(aluno => {
        return aluno.matriculas.some(matricula => 
          matricula.parcelas.some(parcela => {
            if (parcela.status_parcela === 'Paga') return false;
            const dataVencimento = new Date(parcela.data_vencimento);
            const diasAtraso = Math.floor((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24));
            return diasAtraso >= diasLimite;
          })
        );
      });
    }

    return alunosFiltrados;
  };

  const exportarRelatorio = () => {
    const alunosFiltrados = filtrarAlunos();
    const dados = alunosFiltrados.map(aluno => ({
      'Nome': aluno.nome_completo,
      'Número de Ficha': aluno.numero_ficha,
      'Telefone': aluno.telefone_principal,
      'Email': aluno.email || '',
      'Escola': aluno.nome_escola || '',
      'Total Devido': formatCurrency(aluno.matriculas.reduce((total, m) => 
        total + m.parcelas.reduce((sum, p) => sum + parseFloat(p.valor_devido), 0), 0
      )),
      'Parcelas Pendentes': aluno.matriculas.reduce((total, m) => 
        total + m.parcelas.filter(p => p.status_parcela !== 'Paga').length, 0
      )
    }));

    const csvContent = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-alunos-dividas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const alunosFiltrados = filtrarAlunos();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão Financeira</h1>
        <p className="text-gray-600">Relatórios e controle financeiro dos alunos</p>
      </div>

      {/* Estatísticas Gerais */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos com Dívidas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.alunos_com_dividas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Devido</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estatisticas.valor_total_devido)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estatisticas.valor_total_recebido)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Parcelas Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.parcelas_vencidas}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
            <input
              type="text"
              placeholder="Filtrar por escola..."
              value={filtros.escola}
              onChange={(e) => setFiltros(prev => ({ ...prev, escola: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status da Parcela</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Vencida">Vencida</option>
              <option value="Paga">Paga</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Atraso</label>
            <select
              value={filtros.diasVencimento}
              onChange={(e) => setFiltros(prev => ({ ...prev, diasVencimento: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="1">1+ dias</option>
              <option value="7">7+ dias</option>
              <option value="30">30+ dias</option>
              <option value="90">90+ dias</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {alunosFiltrados.length} alunos encontrados
          </p>
          <button
            onClick={exportarRelatorio}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Lista de Alunos com Dívidas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Alunos com Dívidas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Devido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parcelas Pendentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alunosFiltrados.map((aluno) => {
                const totalDevido = aluno.matriculas.reduce((total, matricula) => 
                  total + matricula.parcelas.reduce((sum, parcela) => 
                    sum + parseFloat(parcela.valor_devido), 0
                  ), 0
                );
                
                const parcelasPendentes = aluno.matriculas.reduce((total, matricula) => 
                  total + matricula.parcelas.filter(p => p.status_parcela !== 'Paga').length, 0
                );

                return (
                  <tr key={aluno.id_aluno} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{aluno.nome_completo}</div>
                        <div className="text-sm text-gray-500">#{aluno.numero_ficha}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{aluno.telefone_principal}</div>
                        {aluno.email && (
                          <div className="text-sm text-gray-500">{aluno.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aluno.nome_escola || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(totalDevido)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {parcelasPendentes} parcelas
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setAlunoSelecionado(aluno)}
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Aluno */}
      {alunoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalhes Financeiros - {alunoSelecionado.nome_completo}
                </h3>
                <button
                  onClick={() => setAlunoSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {alunoSelecionado.matriculas.map((matricula) => (
                <div key={matricula.id_matricula} className="mb-6 border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Matrícula #{matricula.id_matricula}</h4>
                  
                  {matricula.resumo_financeiro && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-blue-50 rounded">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">{formatCurrency(matricula.resumo_financeiro.valor_total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pago</p>
                        <p className="font-semibold text-green-600">{formatCurrency(matricula.resumo_financeiro.valor_pago)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pendente</p>
                        <p className="font-semibold text-red-600">{formatCurrency(matricula.resumo_financeiro.valor_pendente)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">% Pago</p>
                        <p className="font-semibold">{matricula.resumo_financeiro.percentual_pago}%</p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Parcela</th>
                          <th className="px-3 py-2 text-left">Vencimento</th>
                          <th className="px-3 py-2 text-left">Valor</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matricula.parcelas.map((parcela) => (
                          <tr key={parcela.id_parcela} className="border-b">
                            <td className="px-3 py-2">#{parcela.numero_parcela}</td>
                            <td className="px-3 py-2">{formatDate(parcela.data_vencimento)}</td>
                            <td className="px-3 py-2">{formatCurrency(parseFloat(parcela.valor_devido))}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status_parcela)}`}>
                                {parcela.status_parcela}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement; 