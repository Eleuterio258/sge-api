import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Trash2, Search, Building, Users, Link, Unlink, AlertCircle, CheckCircle } from "lucide-react";

interface Escola {
  id_escola: number;
  nome_escola: string;
  endereco: string;
  distrito: string;
  provincia: string;
  telefone: string;
  email: string;
  nuit?: string;
  logo_url?: string;
  data_criacao?: string;
  data_atualizacao?: string;
}

interface User {
  id_utilizador: number;
  nome_completo: string;
  email: string;
  telefone: string;
  id_tipo_utilizador: number;
  nome_tipo_utilizador: string;
}

interface Atribuicao {
  id_escola_utilizador: number;
  id_escola: number;
  nome_escola: string;
  id_utilizador: number;
  nome_completo: string;
  email: string;
  nome_tipo_utilizador: string;
  data_atribuicao: string;
  ativo: number;
}

const UserSchoolAssignment: React.FC = () => {
  const { apiClient, accessToken, isAuthenticated, user, isTokenValid } = useAuth();
  const [atribuicoes, setAtribuicoes] = useState<Atribuicao[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEscola, setSelectedEscola] = useState<number | "all">("all");
  const [selectedUser, setSelectedUser] = useState<number | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_escola: "",
    id_utilizador: ""
  });

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
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem atribuir usuários a escolas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchData();
    } else {
      setLoading(false);
      setError("Usuário não autenticado. Faça login novamente.");
    }
  }, [isAuthenticated, accessToken, user]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchData = async () => {
    if (!isAuthenticated || !accessToken) {
      setError("Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetchando dados com token:", accessToken?.substring(0, 50));

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const [atribuicoesRes, escolasRes, usuariosRes] = await Promise.all([
        apiClient.get("/escola-utilizadores/atribuicoes", { headers }),
        apiClient.get("/escolas", { headers }),
        apiClient.get("/auth/users", { headers })
      ]);

      console.log("Dados recebidos:");
      console.log("- Atribuições:", atribuicoesRes.data);
      console.log("- Escolas:", escolasRes.data);
      console.log("- Usuários:", usuariosRes.data);

      // Garantir que os dados sejam arrays
      const atribuicoesData = Array.isArray(atribuicoesRes.data) ? atribuicoesRes.data : 
                             Array.isArray(atribuicoesRes.data.data) ? atribuicoesRes.data.data : [];
      
      const escolasData = Array.isArray(escolasRes.data) ? escolasRes.data : 
                         Array.isArray(escolasRes.data.data) ? escolasRes.data.data : [];
      
      const usuariosData = Array.isArray(usuariosRes.data) ? usuariosRes.data : 
                          Array.isArray(usuariosRes.data.data) ? usuariosRes.data.data : [];

      setAtribuicoes(atribuicoesData);
      setEscolas(escolasData);
      setUsuarios(usuariosData);

      console.log("Estados atualizados:");
      console.log("- Escolas count:", escolasData.length);
      console.log("- Usuários count:", usuariosData.length);

    } catch (error: any) {
      console.error("Erro completo ao buscar dados:", error);
      
      if (error.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (error.response?.status === 403) {
        setError("Acesso negado. Você não tem permissão para acessar esta funcionalidade.");
      } else if (error.response?.status >= 500) {
        setError("Erro no servidor. Tente novamente mais tarde.");
      } else {
        setError("Erro ao carregar dados. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_escola || !formData.id_utilizador) {
      setError("Por favor, selecione uma escola e um usuário.");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      await apiClient.post("/escola-utilizadores/atribuir", {
        id_escola: parseInt(formData.id_escola),
        id_utilizador: parseInt(formData.id_utilizador)
      }, { headers });
      
      setSuccessMessage("Usuário atribuído à escola com sucesso!");
      setShowModal(false);
      setFormData({ id_escola: "", id_utilizador: "" });
      fetchData();
    } catch (error: any) {
      console.error("Erro ao atribuir usuário:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Dados inválidos. Verifique as informações e tente novamente.");
      } else if (error.response?.status === 409) {
        setError("Este usuário já está atribuído a esta escola.");
      } else {
        setError("Erro ao atribuir usuário. Tente novamente.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRemove = async (id_escola: number, id_utilizador: number) => {
    const atribuicao = atribuicoes.find(a => a.id_escola === id_escola && a.id_utilizador === id_utilizador);
    if (!atribuicao) return;

    const confirmMessage = `Tem certeza que deseja remover a atribuição de "${atribuicao.nome_completo}" da escola "${atribuicao.nome_escola}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };

        await apiClient.delete(`/escola-utilizadores/remover/${id_escola}/${id_utilizador}`, { headers });
        setSuccessMessage("Atribuição removida com sucesso!");
        fetchData();
      } catch (error: any) {
        console.error("Erro ao remover atribuição:", error);
        
        if (error.response?.status === 403) {
          setError("Você não tem permissão para remover esta atribuição.");
        } else if (error.response?.status === 404) {
          setError("Atribuição não encontrada.");
        } else {
          setError("Erro ao remover atribuição. Tente novamente.");
        }
      }
    }
  };

  const filteredAtribuicoes = atribuicoes.filter((atribuicao) => {
    const matchesSearch = 
      atribuicao.nome_escola.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atribuicao.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atribuicao.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEscola = selectedEscola === "all" || atribuicao.id_escola === selectedEscola;
    const matchesUser = selectedUser === "all" || atribuicao.id_utilizador === selectedUser;
    
    return matchesSearch && matchesEscola && matchesUser;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (roleId: number) => {
    const colors = {
      1: "bg-red-500", // Super Admin
      2: "bg-blue-500", // Admin Escola
      3: "bg-green-500", // Gestor Geral
      4: "bg-purple-500", // Gestor Escola Específica
      5: "bg-orange-500", // Instrutor
      6: "bg-gray-500", // Aluno
    };
    return colors[roleId as keyof typeof colors] || "bg-gray-500";
  };

  // Função para obter escola selecionada
  const getSelectedEscola = () => {
    if (!formData.id_escola) return null;
    return escolas.find(escola => escola.id_escola === parseInt(formData.id_escola));
  };

  // Função para obter usuário selecionado
  const getSelectedUser = () => {
    if (!formData.id_utilizador) return null;
    return usuarios.find(user => user.id_utilizador === parseInt(formData.id_utilizador));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Atribuição de Usuários a Escolas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as atribuições de usuários às escolas do sistema ({atribuicoes.length} atribuições)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Atribuição
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por escola, usuário ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedEscola}
              onChange={(e) => setSelectedEscola(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todas as escolas</option>
              {escolas.map((escola) => (
                <option key={escola.id_escola} value={escola.id_escola}>
                  {escola.nome_escola}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos os usuários</option>
              {usuarios.map((user) => (
                <option key={user.id_utilizador} value={user.id_utilizador}>
                  {user.nome_completo}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filteredAtribuicoes.length !== atribuicoes.length && (
          <p className="text-sm text-gray-500 mt-2">
            Mostrando {filteredAtribuicoes.length} de {atribuicoes.length} atribuições
          </p>
        )}
      </div>

      {/* Atribuições Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAtribuicoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Atribuição
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAtribuicoes.map((atribuicao) => (
                  <tr key={atribuicao.id_escola_utilizador} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {atribuicao.nome_escola}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {atribuicao.nome_completo}
                        </div>
                        <div className="text-sm text-gray-500">{atribuicao.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(atribuicao.id_tipo_utilizador)}`}>
                        {atribuicao.nome_tipo_utilizador}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(atribuicao.data_atribuicao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemove(atribuicao.id_escola, atribuicao.id_utilizador)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remover atribuição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="mx-auto h-12 w-12" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Nenhuma atribuição encontrada</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || selectedEscola !== "all" || selectedUser !== "all"
                ? "Tente ajustar os filtros de busca" 
                : "Comece criando uma nova atribuição"}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nova Atribuição</h2>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                <p>Debug: Escolas carregadas: {escolas.length}</p>
                <p>Debug: Usuários carregados: {usuarios.length}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escola * ({escolas.length} disponíveis)
                </label>
                <select
                  required
                  value={formData.id_escola}
                  onChange={(e) => setFormData({ ...formData, id_escola: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione uma escola</option>
                  {escolas.length > 0 ? (
                    escolas.map((escola) => (
                      <option key={escola.id_escola} value={escola.id_escola}>
                        {escola.nome_escola}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Nenhuma escola disponível</option>
                  )}
                </select>
              </div>

              {/* Preview da escola selecionada */}
              {formData.id_escola && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  {(() => {
                    const escola = getSelectedEscola();
                    if (!escola) {
                      return <p className="text-red-500 text-sm">Escola não encontrada</p>;
                    }
                    return (
                      <div className="flex items-start gap-4">
                        {escola.logo_url && (
                          <img
                            src={escola.logo_url}
                            alt={`Logo da ${escola.nome_escola}`}
                            className="w-12 h-12 rounded object-contain border bg-white"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{escola.nome_escola}</div>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            {escola.nuit && <div>NUIT: {escola.nuit}</div>}
                            <div>Endereço: {escola.endereco}</div>
                            <div>Distrito: {escola.distrito}</div>
                            <div>Província: {escola.provincia}</div>
                            {escola.telefone && <div>Telefone: {escola.telefone}</div>}
                            {escola.email && <div>Email: {escola.email}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário * ({usuarios.length} disponíveis)
                </label>
                <select
                  required
                  value={formData.id_utilizador}
                  onChange={(e) => setFormData({ ...formData, id_utilizador: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione um usuário</option>
                  {usuarios.length > 0 ? (
                    usuarios.map((user) => (
                      <option key={user.id_utilizador} value={user.id_utilizador}>
                        {user.nome_completo} ({user.nome_tipo_utilizador})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Nenhum usuário disponível</option>
                  )}
                </select>
              </div>

              {/* Preview do usuário selecionado */}
              {formData.id_utilizador && (
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                  {(() => {
                    const user = getSelectedUser();
                    if (!user) {
                      return <p className="text-red-500 text-sm">Usuário não encontrado</p>;
                    }
                    return (
                      <div>
                        <div className="font-semibold text-gray-900">{user.nome_completo}</div>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          <div>Email: {user.email}</div>
                          {user.telefone && <div>Telefone: {user.telefone}</div>}
                          <div>Tipo: {user.nome_tipo_utilizador}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading || !formData.id_escola || !formData.id_utilizador}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Atribuindo...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Atribuir
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ id_escola: "", id_utilizador: "" });
                    setError(null);
                  }}
                  disabled={submitLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSchoolAssignment;