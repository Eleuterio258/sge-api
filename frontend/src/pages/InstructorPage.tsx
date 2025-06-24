import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Instrutor {
  id_instrutor: number;
  nome: string;
  email: string;
  telefone: string;
  cnh: string;
  categoria_cnh: string;
  data_nascimento: string;
  id_escola?: number | string;
}

const API_URL = "http://localhost:4000/api/instrutores";

const InstructorPage: React.FC = () => {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editInstrutor, setEditInstrutor] = useState<Instrutor | null>(null);
  const [form, setForm] = useState<Partial<Instrutor>>({});
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, isTokenValid, getCurrentUserSchool } = useAuth();

  const fetchInstrutores = async () => {
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
      setInstrutores(res.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar instrutores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstrutores();
    // eslint-disable-next-line
  }, [accessToken, isTokenValid, getCurrentUserSchool]);

  const handleOpenModal = (instrutor?: Instrutor) => {
    setEditInstrutor(instrutor || null);
    setForm(instrutor ? { ...instrutor } : {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditInstrutor(null);
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
      if (editInstrutor) {
        // Editar
        await axios.put(`${API_URL}/${editInstrutor.id_instrutor}`, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        // Criar
        await axios.post(API_URL, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      handleCloseModal();
      fetchInstrutores();
    } catch (err) {
      setError("Erro ao salvar instrutor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (instrutor: Instrutor) => {
    if (!window.confirm(`Deseja realmente deletar o instrutor ${instrutor.nome}?`)) return;
    try {
      await axios.delete(`${API_URL}/${instrutor.id_instrutor}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchInstrutores();
    } catch (err) {
      setError("Erro ao deletar instrutor");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-5xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Instrutores da Escola</h1>
            <p className="text-muted-foreground text-lg">Visualize e gerencie os instrutores cadastrados na sua escola</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => handleOpenModal()}
          >
            Novo Instrutor
          </button>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-lg">Carregando instrutores...</p>
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
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Telefone</th>
                  <th className="border px-4 py-2 text-left">CNH</th>
                  <th className="border px-4 py-2 text-left">Categoria CNH</th>
                  <th className="border px-4 py-2 text-left">Data Nascimento</th>
                  <th className="border px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {instrutores.map((instrutor, idx) => (
                  <tr
                    key={instrutor.id_instrutor}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-accent transition-colors"
                        : "bg-muted/50 hover:bg-accent transition-colors"
                    }
                  >
                    <td className="border px-4 py-2">{instrutor.nome}</td>
                    <td className="border px-4 py-2">{instrutor.email}</td>
                    <td className="border px-4 py-2">{instrutor.telefone}</td>
                    <td className="border px-4 py-2">{instrutor.cnh}</td>
                    <td className="border px-4 py-2">{instrutor.categoria_cnh}</td>
                    <td className="border px-4 py-2">{instrutor.data_nascimento}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onClick={() => handleOpenModal(instrutor)}
                      >
                        Editar
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => handleDelete(instrutor)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {instrutores.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum instrutor cadastrado.
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
              <h3 className="text-xl font-bold mb-4 text-foreground">{editInstrutor ? 'Editar Instrutor' : 'Novo Instrutor'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="nome" value={form.nome || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Nome" required />
                <input name="email" value={form.email || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Email" required />
                <input name="telefone" value={form.telefone || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Telefone" required />
                <input name="cnh" value={form.cnh || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="CNH" required />
                <input name="categoria_cnh" value={form.categoria_cnh || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Categoria CNH" required />
                <input name="data_nascimento" type="date" value={form.data_nascimento || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Data de Nascimento" required />
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

export default InstructorPage; 