import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Aula {
  id_aula: number;
  tipo_aula: string;
  data_aula: string;
  hora_inicio: string;
  hora_fim: string;
  id_instrutor: number;
  id_matricula: number;
  id_escola?: number | string;
}

const API_URL = "http://135.181.249.37:4000/api/aulas";

const LessonsPage: React.FC = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAula, setEditAula] = useState<Aula | null>(null);
  const [form, setForm] = useState<Partial<Aula>>({});
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, isTokenValid, getCurrentUserSchool } = useAuth();

  const fetchAulas = async () => {
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
      setAulas(res.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar aulas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
    // eslint-disable-next-line
  }, [accessToken, isTokenValid, getCurrentUserSchool]);

  const handleOpenModal = (aula?: Aula) => {
    setEditAula(aula || null);
    setForm(aula ? { ...aula } : {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditAula(null);
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
      if (editAula) {
        // Editar
        await axios.put(`${API_URL}/${editAula.id_aula}`, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        // Criar
        await axios.post(API_URL, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      handleCloseModal();
      fetchAulas();
    } catch (err) {
      setError("Erro ao salvar aula");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (aula: Aula) => {
    if (!window.confirm(`Deseja realmente deletar a aula do dia ${aula.data_aula}?`)) return;
    try {
      await axios.delete(`${API_URL}/${aula.id_aula}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchAulas();
    } catch (err) {
      setError("Erro ao deletar aula");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-5xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Aulas da Escola</h1>
            <p className="text-muted-foreground text-lg">Visualize e gerencie as aulas cadastradas na sua escola</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => handleOpenModal()}
          >
            Nova Aula
          </button>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-lg">Carregando aulas...</p>
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
                  <th className="border px-4 py-2 text-left">Tipo</th>
                  <th className="border px-4 py-2 text-left">Data</th>
                  <th className="border px-4 py-2 text-left">Início</th>
                  <th className="border px-4 py-2 text-left">Fim</th>
                  <th className="border px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {aulas.map((aula, idx) => (
                  <tr
                    key={aula.id_aula}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-accent transition-colors"
                        : "bg-muted/50 hover:bg-accent transition-colors"
                    }
                  >
                    <td className="border px-4 py-2">{aula.tipo_aula}</td>
                    <td className="border px-4 py-2">{aula.data_aula}</td>
                    <td className="border px-4 py-2">{aula.hora_inicio}</td>
                    <td className="border px-4 py-2">{aula.hora_fim}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onClick={() => handleOpenModal(aula)}
                      >
                        Editar
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => handleDelete(aula)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {aulas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma aula cadastrada.
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
              <h3 className="text-xl font-bold mb-4 text-foreground">{editAula ? 'Editar Aula' : 'Nova Aula'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="tipo_aula" value={form.tipo_aula || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Tipo de Aula" required />
                <input name="data_aula" type="date" value={form.data_aula || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Data" required />
                <input name="hora_inicio" value={form.hora_inicio || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Hora de Início" required />
                <input name="hora_fim" value={form.hora_fim || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Hora de Fim" required />
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

export default LessonsPage; 