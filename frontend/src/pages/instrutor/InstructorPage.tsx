import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Instrutor, CreateInstrutorRequest, UpdateInstrutorRequest } from "@/types/instructor";

const API_URL = "http://135.181.249.37:4000/api/instrutores";

const InstructorPage: React.FC = () => {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editInstrutor, setEditInstrutor] = useState<Instrutor | null>(null);
  const [form, setForm] = useState<Partial<Instrutor>>({});
  const [submitting, setSubmitting] = useState(false);
  const { accessToken, isTokenValid, getCurrentUserSchool, user } = useAuth();

  const fetchInstrutores = async () => {
    const schoolId = getCurrentUserSchool();
    if (!accessToken || !isTokenValid()) {
      setError("Token de acesso inválido. Faça login novamente.");
      setLoading(false);
      return;
    }
    
    // For Super Admin, don't require a specific school
    if (!schoolId && user?.id_tipo_utilizador !== 1) {
      setError("Você não está atribuído a nenhuma escola. Contacte o administrador.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // If user has a school, try school-specific endpoint first
      if (schoolId) {
        try {
          const res = await axios.get(`${API_URL}/escola/${schoolId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setInstrutores(res.data);
          setError(null);
          return;
        } catch (err: any) {
          // If school-specific endpoint fails, fall back to general endpoint
          console.log('School-specific endpoint failed, trying general endpoint');
        }
      }
      
      // Fallback to general endpoint
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setInstrutores(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching instructors:', err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Você não tem permissão para acessar esta funcionalidade.");
      } else {
        setError("Erro ao buscar instrutores. Tente novamente.");
      }
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
    
    // For Super Admin, allow creating instructors without a specific school
    if (!schoolId && user?.id_tipo_utilizador !== 1) {
      setError("Você não está atribuído a nenhuma escola. Contacte o administrador.");
      setSubmitting(false);
      return;
    }
    
    try {
      if (editInstrutor) {
        // Editar - only update instructor-specific fields
        await axios.put(`${API_URL}/${editInstrutor.id_instrutor}`, { 
          cnh: form.cnh,
          categoria_cnh: form.categoria_cnh,
          data_nascimento: form.data_nascimento,
          id_escola: schoolId 
        }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        // Criar - requires id_utilizador to link to existing user
        if (!form.id_utilizador) {
          setError("É necessário selecionar um utilizador para criar um instrutor");
          setSubmitting(false);
          return;
        }
        await axios.post(API_URL, { 
          id_utilizador: form.id_utilizador,
          cnh: form.cnh,
          categoria_cnh: form.categoria_cnh,
          data_nascimento: form.data_nascimento,
          id_escola: schoolId 
        }, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
      handleCloseModal();
      fetchInstrutores();
    } catch (err: any) {
      console.error('Error saving instructor:', err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Você não tem permissão para realizar esta ação.");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Dados inválidos. Verifique as informações.");
      } else {
        setError("Erro ao salvar instrutor. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (instrutor: Instrutor) => {
    if (!window.confirm(`Deseja realmente deletar o instrutor ${instrutor.nome_completo}?`)) return;
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
                {instrutores.length > 0 ? (
                  instrutores.map((instrutor, idx) => (
                    <tr
                      key={instrutor.id_instrutor}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:bg-accent transition-colors"
                          : "bg-muted/50 hover:bg-accent transition-colors"
                      }
                    >
                      <td className="border px-4 py-2">{instrutor.nome_completo}</td>
                      <td className="border px-4 py-2">{instrutor.email}</td>
                      <td className="border px-4 py-2">{instrutor.telefone}</td>
                      <td className="border px-4 py-2">{instrutor.cnh || '-'}</td>
                      <td className="border px-4 py-2">{instrutor.categoria_cnh || '-'}</td>
                      <td className="border px-4 py-2">{instrutor.data_nascimento ? new Date(instrutor.data_nascimento).toLocaleDateString('pt-BR') : '-'}</td>
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
                  ))
                ) : (
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
                {!editInstrutor && (
                  <input 
                    name="id_utilizador" 
                    type="number"
                    value={form.id_utilizador || ''} 
                    onChange={handleChange} 
                    className="p-2 border rounded w-full" 
                    placeholder="ID do Utilizador" 
                    required 
                  />
                )}
                <input name="cnh" value={form.cnh || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="CNH" />
                <input name="categoria_cnh" value={form.categoria_cnh || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Categoria CNH" />
                <input name="data_nascimento" type="date" value={form.data_nascimento || ''} onChange={handleChange} className="p-2 border rounded w-full" placeholder="Data de Nascimento" />
                
                <div className="flex gap-2 justify-end">
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