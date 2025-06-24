import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit, Car, CheckCircle, AlertCircle } from 'lucide-react';

interface Veiculo {
  id_veiculo: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  categoria: string;
  id_escola: number;
  id_instrutor: number | null;
}

interface Escola {
  id_escola: number;
  nome_escola: string;
}

const initialForm: Partial<Veiculo> = {
  placa: '',
  modelo: '',
  marca: '',
  ano: new Date().getFullYear(),
  categoria: '',
  id_escola: 0,
  id_instrutor: null,
};

const VehiclesManagement: React.FC = () => {
  const { apiClient, accessToken, isAuthenticated, user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Veiculo>>(initialForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  const canManage = isAuthenticated && user && [1, 2].includes(user.id_tipo_utilizador);

  useEffect(() => {
    if (canManage) {
      fetchVeiculos();
      fetchEscolas();
    } else setLoading(false);
    // eslint-disable-next-line
  }, [accessToken, isAuthenticated]);

  const fetchVeiculos = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/veiculos', { headers });
      setVeiculos(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError('Erro ao buscar veículos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEscolas = async () => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const res = await apiClient.get('/escolas', { headers });
      setEscolas(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (e) {
      setEscolas([]);
    }
  };

  const handleOpenModal = (veiculo?: Veiculo) => {
    if (veiculo) {
      setEditId(veiculo.id_veiculo);
      setForm({ ...veiculo });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'ano' || name === 'id_escola' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      if (editId) {
        await apiClient.put(`/veiculos/${editId}`, form, { headers });
        setSuccess('Veículo atualizado com sucesso!');
      } else {
        await apiClient.post('/veiculos', form, { headers });
        setSuccess('Veículo criado com sucesso!');
      }
      fetchVeiculos();
      handleCloseModal();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao salvar veículo.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este veículo?')) return;
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await apiClient.delete(`/veiculos/${id}`, { headers });
      setSuccess('Veículo removido com sucesso!');
      fetchVeiculos();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao remover veículo.');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800 mb-1">Acesso negado</h3>
            <p className="text-sm text-red-700">Você não tem permissão para gerenciar veículos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="w-7 h-7" /> Gestão de Veículos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os veículos cadastrados no sistema.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Veículo
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

      {/* Tabela de veículos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : veiculos.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Escola</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {veiculos.map((v) => (
                <tr key={v.id_veiculo} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{v.placa}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.modelo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.marca}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.ano}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.categoria}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{v.id_escola}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleOpenModal(v)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors mr-2"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id_veiculo)}
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
          <div className="text-center py-12 text-gray-400">Nenhum veículo cadastrado.</div>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar Veículo' : 'Novo Veículo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input
                  type="text"
                  name="placa"
                  value={form.placa || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input
                  type="text"
                  name="modelo"
                  value={form.modelo || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  type="text"
                  name="marca"
                  value={form.marca || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                <input
                  type="number"
                  name="ano"
                  value={form.ano || ''}
                  onChange={handleChange}
                  required
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escola *</label>
                <select
                  name="id_escola"
                  value={form.id_escola || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione a escola</option>
                  {escolas.map((escola) => (
                    <option key={escola.id_escola} value={escola.id_escola}>
                      {escola.nome_escola}
                    </option>
                  ))}
                </select>
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

export default VehiclesManagement; 