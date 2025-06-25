import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Edit, Trash2, Search, Filter, AlertCircle, CheckCircle } from "lucide-react";

interface User {
  id_utilizador: number;
  nome_completo: string;
  email: string;
  telefone: string;
  id_tipo_utilizador: number;
  ativo: number;
  data_criacao: string;
  data_atualizacao: string;
  nome_tipo_utilizador: string;
}

interface UserFormData {
  nome_completo: string;
  email: string;
  telefone: string;
  id_tipo_utilizador: number;
  senha?: string;
}

const UsersManagement: React.FC = () => {
  const { apiClient, user, isAuthenticated, accessToken, isTokenValid } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<number | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nome_completo: "",
    email: "",
    telefone: "",
    id_tipo_utilizador: 2,
  });

  // Tipos de utilizador baseados na base de dados
  const userTypes = [
    { id: 1, name: "Super Admin", description: "Administrador com acesso total ao sistema." },
    { id: 2, name: "Admin Escola", description: "Administrador de uma ou mais escolas específicas." },
    { id: 3, name: "Gestor Geral", description: "Gestor com visão agregada de todas as escolas." },
    { id: 4, name: "Gestor Escola Específica", description: "Gestor operacional de uma escola específica." },
    { id: 5, name: "Instrutor", description: "Instrutor de condução." },
    { id: 6, name: "Aluno", description: "Aluno matriculado na escola." },
  ];

  // Verificação de permissões simplificada
  const hasPermission = () => {
    return isAuthenticated && user && user.id_tipo_utilizador === 1;
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUsers();
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

  const fetchUsers = async () => {
    if (!hasPermission()) {
      setError("Você não tem permissão para acessar esta funcionalidade.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Debug: log do token antes da requisição
      console.log("Token antes da requisição:", accessToken);
      console.log("Token válido?", isTokenValid());
      
      // Fazer a requisição com headers explícitos
      const response = await apiClient.get("/auth/users", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Resposta da API:", response.data);
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error("Erro completo:", error);
      console.error("Response:", error.response);
      console.error("Request config:", error.config);
      
      if (error.response?.status === 401) {
        // Tentar refresh do token
        console.log("Token expirado, tentando refresh...");
        try {
          await refreshTokenAndRetry();
        } catch (refreshError) {
          setError("Sessão expirada. Faça login novamente.");
        }
      } else if (error.response?.status === 403) {
        setError("Acesso negado. Você não tem permissão para acessar esta funcionalidade.");
      } else if (error.response?.status >= 500) {
        setError("Erro no servidor. Tente novamente mais tarde.");
      } else {
        setError("Erro ao carregar usuários. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshTokenAndRetry = async () => {
    // Esta função será implementada se necessário
    // Por enquanto, vamos apenas mostrar o erro
    throw new Error("Token refresh não implementado");
  };

  const validateForm = (): string | null => {
    if (!formData.nome_completo.trim()) {
      return "Nome completo é obrigatório.";
    }
    if (!formData.email.trim()) {
      return "Email é obrigatório.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Email inválido.";
    }
    if (!formData.telefone.trim()) {
      return "Telefone é obrigatório.";
    }
    if (!/^\+?[0-9\s\-()]{9,}$/.test(formData.telefone)) {
      return "Telefone inválido.";
    }
    if (!editingUser && (!formData.senha || formData.senha.length < 6)) {
      return "Senha deve ter pelo menos 6 caracteres.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.senha || updateData.senha.trim() === "") {
          delete updateData.senha;
        }
        await apiClient.put(`/auth/users/${editingUser.id_utilizador}`, updateData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        setSuccessMessage("Usuário atualizado com sucesso!");
      } else {
        await apiClient.post("/auth/register", formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        setSuccessMessage("Usuário criado com sucesso!");
      }
      
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Dados inválidos. Verifique as informações e tente novamente.");
      } else if (error.response?.status === 409) {
        setError("Email já está em uso por outro usuário.");
      } else {
        setError("Erro ao salvar usuário. Tente novamente.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome_completo: user.nome_completo,
      email: user.email,
      telefone: user.telefone,
      id_tipo_utilizador: user.id_tipo_utilizador,
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    const userToDelete = users.find(u => u.id_utilizador === userId);
    if (!userToDelete) return;

    const confirmMessage = `Tem certeza que deseja excluir o usuário "${userToDelete.nome_completo}"? Esta ação não pode ser desfeita.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await apiClient.delete(`/auth/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        setSuccessMessage("Usuário excluído com sucesso!");
        fetchUsers();
      } catch (error: any) {
        console.error("Erro ao excluir usuário:", error);
        
        if (error.response?.status === 403) {
          setError("Você não tem permissão para excluir este usuário.");
        } else if (error.response?.status === 404) {
          setError("Usuário não encontrado.");
        } else {
          setError("Erro ao excluir usuário. Tente novamente.");
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: "",
      email: "",
      telefone: "",
      id_tipo_utilizador: 2,
    });
    setError(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.id_tipo_utilizador === filterRole;
    return matchesSearch && matchesRole;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (!hasPermission()) {
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
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem gerenciar usuários.</p>
                <div className="mt-4 p-4 bg-red-100 rounded-md">
                  <p className="font-medium mb-2">Para acessar esta funcionalidade, você precisa:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fazer login como Super Admin (tipo 1)</li>
                    <li>Usar as credenciais de teste: superadmin@example.com / senhaSegura123</li>
                  </ul>
                </div>
                {/* Debug Information */}
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <p className="font-medium mb-2 text-gray-800">Informações de Debug:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Usuário atual: {user ? `${user.nome_completo} (${user.email})` : 'Não autenticado'}</p>
                    <p>Tipo de usuário: {user?.id_tipo_utilizador || 'N/A'}</p>
                    <p>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</p>
                    <p>Token existe: {accessToken ? 'Sim' : 'Não'}</p>
                    <p>Token válido: {isTokenValid() ? 'Sim' : 'Não'}</p>
                    <p>Token (primeiros 50 chars): {accessToken?.substring(0, 50)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                onClick={fetchUsers}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema ({users.length} usuários)</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

  

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              {userTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filteredUsers.length !== users.length && (
          <p className="text-sm text-gray-500 mt-2">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </p>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id_utilizador} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nome_completo}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.telefone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(user.id_tipo_utilizador)}`}>
                        {user.nome_tipo_utilizador}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.data_criacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id_utilizador)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Nenhum usuário encontrado</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || filterRole !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Comece criando um novo usuário"}
            </p>
          </div>
        )}
      </div>

      {/* Modal - mesmo código anterior... */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Digite o email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+258841234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário *
                </label>
                <select
                  required
                  value={formData.id_tipo_utilizador}
                  onChange={(e) => setFormData({ ...formData, id_tipo_utilizador: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {userTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {userTypes.find(t => t.id === formData.id_tipo_utilizador)?.description}
                </p>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.senha || ""}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha (opcional)
                  </label>
                  <input
                    type="password"
                    value={formData.senha || ""}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    minLength={6}
                    placeholder="Deixe em branco para manter a atual"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {editingUser ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    editingUser ? "Atualizar" : "Criar"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
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

export default UsersManagement;