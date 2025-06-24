import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
 

interface Veiculo {
  id_veiculo: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  categoria: string;
  id_escola?: number | string;
}

const API_URL = "http://135.181.249.37:4000/api/veiculos";

const VehiclesPage: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editVeiculo, setEditVeiculo] = useState<Veiculo | null>(null);
  const [form, setForm] = useState<Partial<Veiculo>>({});
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, isTokenValid, getCurrentUserSchool } = useAuth();

  const fetchVeiculos = async () => {
    const schoolId = getCurrentUserSchool();
    if (!accessToken || !isTokenValid() || !schoolId) {
      setError("Token de acesso inválido ou escola não encontrada. Faça login novamente.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/escola/${schoolId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setVeiculos(res.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar veículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeiculos();
    // eslint-disable-next-line
  }, [accessToken, isTokenValid, getCurrentUserSchool]);

  const handleOpenModal = (veiculo?: Veiculo) => {
    setEditVeiculo(veiculo || null);
    setForm(veiculo ? { ...veiculo } : {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditVeiculo(null);
    setForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const schoolId = getCurrentUserSchool();
    try {
      if (editVeiculo) {
        // Editar
        await axios.put(`${API_URL}/${editVeiculo.id_veiculo}`, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        // Criar
        await axios.post(API_URL, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      handleCloseModal();
      fetchVeiculos();
    } catch (err) {
      setError("Erro ao salvar veículo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (veiculo: Veiculo) => {
    if (!window.confirm(`Deseja realmente deletar o veículo ${veiculo.placa}?`)) return;
    try {
      await axios.delete(`${API_URL}/${veiculo.id_veiculo}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchVeiculos();
    } catch (err) {
      setError("Erro ao deletar veículo");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-5xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Veículos da Escola</h1>
            <p className="text-muted-foreground text-lg">Visualize e gerencie os veículos cadastrados na sua escola</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => handleOpenModal()}
          >
            Novo Veículo
          </button>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-lg">Carregando veículos...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive text-lg font-semibold mb-2">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden bg-background">
              <thead>
                <tr className="bg-muted">
                  <th className="border px-4 py-2 text-left">Placa</th>
                  <th className="border px-4 py-2 text-left">Modelo</th>
                  <th className="border px-4 py-2 text-left">Marca</th>
                  <th className="border px-4 py-2 text-left">Ano</th>
                  <th className="border px-4 py-2 text-left">Categoria</th>
                  <th className="border px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo, idx) => (
                  <tr
                    key={veiculo.id_veiculo}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-accent transition-colors"
                        : "bg-muted/50 hover:bg-accent transition-colors"
                    }
                  >
                    <td className="border px-4 py-2">{veiculo.placa}</td>
                    <td className="border px-4 py-2">{veiculo.modelo}</td>
                    <td className="border px-4 py-2">{veiculo.marca}</td>
                    <td className="border px-4 py-2">{veiculo.ano}</td>
                    <td className="border px-4 py-2">{veiculo.categoria}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onClick={() => handleOpenModal(veiculo)}
                      >
                        Editar
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => handleDelete(veiculo)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {veiculos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum veículo cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal de criar/editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4 text-foreground">{editVeiculo ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="placa" value={form.placa || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Placa" required />
                <input name="modelo" value={form.modelo || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Modelo" required />
                <input name="marca" value={form.marca || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Marca" required />
                <input name="ano" value={form.ano || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Ano" required />
                <input name="categoria" value={form.categoria || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Categoria" required />
                {/* Adicione outros campos necessários aqui */}
                <div className="flex gap-4 justify-end mt-4">
                  <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded" disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage; 