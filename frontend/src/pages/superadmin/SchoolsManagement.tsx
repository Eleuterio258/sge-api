import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Building, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

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

const initialForm: Partial<Escola> = {
  nome_escola: '',
  endereco: '',
  distrito: '',
  provincia: '',
  telefone: '',
  email: '',
  nuit: '',
  logo_url: '',
};

const SchoolsManagement: React.FC = () => {
  const { apiClient, accessToken, isAuthenticated, user } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Escola>>(initialForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchEscolas();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [isAuthenticated, accessToken, user]);

  const fetchEscolas = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/escolas', { headers });
      let escolas = Array.isArray(res.data) ? res.data : (res.data.data || []);
      // Se for Admin Local, filtrar pela escola do usuário
      if (user && user.id_tipo_utilizador === 2) {
        const userSchoolId = Number(user.schoolId);
        escolas = escolas.filter((escola: any) => escola.id_escola === userSchoolId);
      }
      setEscolas(escolas);
    } catch (e: any) {
      setError('Erro ao buscar escolas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (escola?: Escola) => {
    if (escola) {
      setEditId(escola.id_escola);
      setForm({ ...escola });
    } else {
      setEditId(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditId(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      if (editId) {
        await apiClient.put(`/escolas/${editId}`, form, { headers });
        setSuccess('Escola atualizada com sucesso!');
      } else {
        await apiClient.post('/escolas', form, { headers });
        setSuccess('Escola criada com sucesso!');
      }
      fetchEscolas();
      handleCloseModal();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar escola.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta escola?')) return;
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await apiClient.delete(`/escolas/${id}`, { headers });
      setSuccess('Escola removida com sucesso!');
      fetchEscolas();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao remover escola.');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Bloqueio de acesso para não Super Admin
  if (!isAuthenticated || !user || user.id_tipo_utilizador !== 1) {
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
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem gerenciar escolas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building className="w-6 h-6" /> Gestão de Escolas (Admin)
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Escola
        </button>
      </div>
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-green-700 text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : escolas.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distrito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Província</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {escolas.map((escola) => (
                <tr key={escola.id_escola} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{escola.nome_escola}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{escola.endereco}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{escola.distrito}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{escola.provincia}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{escola.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{escola.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleOpenModal(escola)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors mr-2"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(escola.id_escola)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">Nenhuma escola cadastrada.</div>
        )}
      </div>
      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar Escola' : 'Nova Escola'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="nome_escola"
                  value={form.nome_escola || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={form.endereco || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                <input
                  type="text"
                  name="distrito"
                  value={form.distrito || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Província *</label>
                <input
                  type="text"
                  name="provincia"
                  value={form.provincia || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={form.telefone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NUIT</label>
                <input
                  type="text"
                  name="nuit"
                  value={form.nuit || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  name="logo_url"
                  value={form.logo_url || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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

export default SchoolsManagement; 