import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Aluno {
  id_aluno: number;
  numero_ficha: string;
  nome_completo: string;
  email: string;
  foto_url?: string;
  id_escola?: number | string;
}

const API_URL = "http://localhost:4000/api/alunos";

const StudentsPage: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAluno, setEditAluno] = useState<Aluno | null>(null);
  const [form, setForm] = useState<Partial<Aluno>>({});
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, isTokenValid, getCurrentUserSchool } = useAuth();

  const fetchAlunos = async () => {
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
      setAlunos(res.data);
      setError(null);
    } catch (err) {
      setError("Erro ao buscar alunos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
    // eslint-disable-next-line
  }, [accessToken, isTokenValid, getCurrentUserSchool]);

  const handleOpenModal = (aluno?: Aluno) => {
    setEditAluno(aluno || null);
    setForm(aluno ? { ...aluno } : {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditAluno(null);
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
      if (editAluno) {
        // Editar
        await axios.put(`${API_URL}/${editAluno.id_aluno}`, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        // Criar
        await axios.post(API_URL, { ...form, id_escola: schoolId }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      handleCloseModal();
      fetchAlunos();
    } catch (err) {
      setError("Erro ao salvar aluno");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (aluno: Aluno) => {
    if (!window.confirm(`Deseja realmente deletar o aluno ${aluno.nome_completo}?`)) return;
    try {
      await axios.delete(`${API_URL}/${aluno.id_aluno}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchAlunos();
    } catch (err) {
      setError("Erro ao deletar aluno");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-5xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Estudantes da Escola</h1>
            <p className="text-muted-foreground text-lg">Visualize e gerencie os estudantes cadastrados na sua escola</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => handleOpenModal()}
          >
            Novo Estudante
          </button>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground text-lg">Carregando alunos...</p>
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
                  <th className="border px-4 py-2 text-left">Foto</th>
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Ficha</th>
                  <th className="border px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno, idx) => (
                  <tr
                    key={aluno.id_aluno}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-accent transition-colors"
                        : "bg-muted/50 hover:bg-accent transition-colors"
                    }
                  >
                    <td className="border px-4 py-2">
                      {aluno.foto_url ? (
                        <img
                          src={aluno.foto_url}
                          alt={aluno.nome_completo}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="border px-4 py-2 font-medium">{aluno.nome_completo}</td>
                    <td className="border px-4 py-2">{aluno.email}</td>
                    <td className="border px-4 py-2">{aluno.numero_ficha}</td>
                    <td className="border px-4 py-2 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onClick={() => handleOpenModal(aluno)}
                      >
                        Editar
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-md bg-red-500 text-white hover:bg-red-600 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={() => handleDelete(aluno)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {alunos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum aluno cadastrado.
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
              <h3 className="text-xl font-bold mb-4 text-foreground">{editAluno ? 'Editar Estudante' : 'Novo Estudante'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="nome_completo" value={form.nome_completo || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Nome Completo" required />
                <input name="numero_ficha" value={form.numero_ficha || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Número da Ficha" required />
                <input name="email" value={form.email || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Email" required />
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

export default StudentsPage; 