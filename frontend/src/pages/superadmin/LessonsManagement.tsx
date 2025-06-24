import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Instrutor } from '@/types/instructor';

interface Aula {
  id_aula: number;
  id_matricula: number;
  id_instrutor: number;
  tipo_aula: string;
  data_aula: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
  rubrica_aluno?: string;
  rubrica_instrutor?: string;
  observacoes?: string;
}

interface Matricula {
  id_matricula: number;
  id_aluno: number;
  id_escola: number;
  id_categoria_carta: number;
  nome_aluno?: string;
}

const initialForm: Partial<Aula> = {
  id_matricula: 0,
  id_instrutor: 0,
  tipo_aula: '',
  data_aula: '',
  hora_inicio: '',
  hora_fim: '',
  duracao_minutos: 60,
  observacoes: '',
};

const LessonsManagement = () => {
  const { apiClient, accessToken, isAuthenticated, user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Aula>>(initialForm);
  const [submitLoading, setSubmitLoading] = useState(false);

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
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem gerenciar aulas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Permissões: 1=Super Admin, 2=Admin Escola, 4=Gestor Escola Específica
  const canManage = isAuthenticated && user && [1, 2, 4].includes(user.id_tipo_utilizador);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchAulas();
      fetchMatriculas();
      fetchInstrutores();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [accessToken, isAuthenticated]);

  const fetchAulas = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/aulas', { headers });
      setAulas(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError('Erro ao buscar aulas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatriculas = async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/matriculas', { headers });
      setMatriculas(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setMatriculas([]);
    }
  };

  const fetchInstrutores = async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/instrutores', { headers });
      setInstrutores(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setInstrutores([]);
    }
  };

  const handleOpenModal = (aula?: Aula) => {
    if (aula) {
      setEditId(aula.id_aula);
      setForm({ ...aula });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'duracao_minutos' || name === 'id_matricula' || name === 'id_instrutor' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      if (editId) {
        await apiClient.put(`/aulas/${editId}`, form, { headers });
        setSuccess('Aula atualizada com sucesso!');
      } else {
        await apiClient.post('/aulas', form, { headers });
        setSuccess('Aula criada com sucesso!');
      }
      fetchAulas();
      handleCloseModal();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar aula.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta aula?')) return;
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await apiClient.delete(`/aulas/${id}`, { headers });
      setSuccess('Aula removida com sucesso!');
      fetchAulas();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao remover aula.');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7" /> Gestão de Aulas
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as aulas cadastradas no sistema.</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Aula
          </button>
        )}
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

      {/* Tabela de aulas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : aulas.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração (min)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                {canManage && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aulas.map((a) => {
                const matricula = matriculas.find(m => m.id_matricula === a.id_matricula);
                const instrutor = instrutores.find(i => i.id_instrutor === a.id_instrutor);
                return (
                  <tr key={a.id_aula} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{matricula ? `${matricula.id_matricula}${matricula.nome_aluno ? ' - ' + matricula.nome_aluno : ''}` : a.id_matricula}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{instrutor ? instrutor.nome_completo : a.id_instrutor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.tipo_aula}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.data_aula}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.hora_inicio}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.hora_fim}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.duracao_minutos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.observacoes}</td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenModal(a)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors mr-2"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id_aula)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">Nenhuma aula cadastrada.</div>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar Aula' : 'Nova Aula'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
                <select
                  name="id_matricula"
                  value={form.id_matricula || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione uma matrícula</option>
                  {matriculas.map((m) => (
                    <option key={m.id_matricula} value={m.id_matricula}>
                      {m.id_matricula}{m.nome_aluno ? ' - ' + m.nome_aluno : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instrutor *</label>
                <select
                  name="id_instrutor"
                  value={form.id_instrutor || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione um instrutor</option>
                  {instrutores.map((i) => (
                    <option key={i.id_instrutor} value={i.id_instrutor}>{i.nome_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Aula *</label>
                <input
                  type="text"
                  name="tipo_aula"
                  value={form.tipo_aula || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  name="data_aula"
                  value={form.data_aula || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início *</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={form.hora_inicio || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim *</label>
                  <input
                    type="time"
                    name="hora_fim"
                    value={form.hora_fim || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos) *</label>
                <input
                  type="number"
                  name="duracao_minutos"
                  value={form.duracao_minutos || ''}
                  onChange={handleChange}
                  required
                  min={1}
                  max={480}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  name="observacoes"
                  value={form.observacoes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
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

export default LessonsManagement; 