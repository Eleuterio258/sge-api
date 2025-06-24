import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

interface Aluno {
  id_aluno: number;
  numero_ficha: string;
  nome_completo: string;
  email: string;
  foto_url?: string;
  apelido: string;
  data_nascimento: string;
  estado_civil: string;
  telefone_principal: string;
  genero: string;
  matriculas?: any[];
}

interface NovoAluno {
  id_escola: number;
  numero_ficha: string;
  nome_completo: string;
  apelido: string;
  data_nascimento: string;
  estado_civil: string;
  nome_pai: string;
  nome_mae: string;
  local_nascimento: string;
  tipo_identificacao: string;
  numero_identificacao: string;
  pais_origem: string;
  profissao: string;
  endereco: string;
  numero_casa: string;
  telefone_principal: string;
  telefone_alternativo: string;
  email: string;
  genero: string;
  foto_url?: string;
}

const API_URL = "http://localhost:4000/api/alunos";

const StudentManagements = () => {
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNovoAluno, setShowNovoAluno] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [novoAluno, setNovoAluno] = useState<NovoAluno>({
    id_escola: 1,
    numero_ficha: "",
    nome_completo: "",
    apelido: "",
    data_nascimento: "",
    estado_civil: "",
    nome_pai: "",
    nome_mae: "",
    local_nascimento: "",
    tipo_identificacao: "",
    numero_identificacao: "",
    pais_origem: "",
    profissao: "",
    endereco: "",
    numero_casa: "",
    telefone_principal: "",
    telefone_alternativo: "",
    email: "",
    genero: "",
    foto_url: ""
  });
  const [previewFoto, setPreviewFoto] = useState<string>("");
  const navigate = useNavigate();

  const token =  localStorage.getItem('accessToken');

  const fetchStudents = async () => {
    if (!user || !token) {
      setError("Usuário não autenticado ou token inválido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Buscando alunos...");
      
      const response = await axios.get(API_URL, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log("Resposta da API:", response.data);
      
      // A API retorna um array diretamente
      if (Array.isArray(response.data)) {
        setAlunos(response.data);
        console.log(`${response.data.length} alunos carregados com sucesso`);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError("Formato de dados inválido recebido da API");
      }
    } catch (err: any) {
      console.error("Erro ao buscar alunos:", err);
      
      if (err.response?.status === 401) {
        setError("Token expirado. Faça login novamente.");
      } else if (err.response?.status === 403) {
        setError("Acesso negado. Verifique suas permissões.");
      } else if (err.response?.status === 404) {
        setError("Endpoint não encontrado. Verifique a URL da API.");
      } else if (err.code === 'ECONNREFUSED') {
        setError("Não foi possível conectar ao servidor. Verifique se a API está rodando.");
      } else {
        setError(`Erro ao carregar alunos: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user, token]);

  const handleNovoAlunoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoAluno((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await axios.post("http://localhost:4000/api/uploads", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setNovoAluno((prev) => ({ ...prev, foto_url: res.data.url }));
    } catch (err) {
      console.log("Upload endpoint não disponível, usando preview local");
      setNovoAluno((prev) => ({ ...prev, foto_url: previewUrl }));
    }
  };

  const resetNovoAlunoForm = () => {
    setNovoAluno({
      id_escola: 1,
      numero_ficha: "",
      nome_completo: "",
      apelido: "",
      data_nascimento: "",
      estado_civil: "",
      nome_pai: "",
      nome_mae: "",
      local_nascimento: "",
      tipo_identificacao: "",
      numero_identificacao: "",
      pais_origem: "",
      profissao: "",
      endereco: "",
      numero_casa: "",
      telefone_principal: "",
      telefone_alternativo: "",
      email: "",
      genero: "",
      foto_url: ""
    });
    setPreviewFoto("");
  };

  const handleNovoAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      console.log("Criando novo aluno:", novoAluno);
      
      await axios.post(API_URL, novoAluno, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Aluno criado com sucesso");
      setShowNovoAluno(false);
      resetNovoAlunoForm();
      
      // Recarregar lista de alunos
      await fetchStudents();
      
    } catch (err: any) {
      console.error("Erro ao criar aluno:", err);
      setError(`Erro ao criar aluno: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground text-lg">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro de Autenticação</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Usuário não autenticado. Faça login para continuar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Permission check
  if (user.id_tipo_utilizador !== 1) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro de Acesso</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Você não tem permissão para acessar esta funcionalidade. Apenas Super Admins podem gerenciar estudantes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-6xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Gestão de Alunos</h1>
            <p className="text-muted-foreground text-lg">
              Visualize e gerencie os alunos cadastrados no sistema ({alunos.length} alunos)
            </p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => setShowNovoAluno(true)}
          >
            Novo Aluno
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchStudents();
              }}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Students table */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden bg-background">
              <thead>
                <tr className="bg-muted">
                  <th className="border px-4 py-2 text-left">Foto</th>
                  <th className="border px-4 py-2 text-left">Nome</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Ficha</th>
                  <th className="border px-4 py-2 text-left">Telefone</th>
                  <th className="border px-4 py-2 text-left">Gênero</th>
                  <th className="border px-4 py-2 text-left">Matrículas</th>
                  <th className="border px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length > 0 ? (
                  alunos.map((aluno, idx) => (
                    <tr
                      key={aluno.id_aluno}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:bg-accent transition-colors"
                          : "bg-muted/50 hover:bg-accent transition-colors"
                      }
                    >
                      <td className="border px-4 py-2">
                        {aluno.foto_url && aluno.foto_url !== "http://example.com/aluno.jpg" && aluno.foto_url !== "http://example.com/maria.jpg" ? (
                          <img
                            src={aluno.foto_url}
                            alt={aluno.nome_completo}
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling!.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-muted-foreground text-xs"
                          style={{ 
                            display: (!aluno.foto_url || 
                              aluno.foto_url === "http://example.com/aluno.jpg" || 
                              aluno.foto_url === "http://example.com/maria.jpg") ? 'block' : 'none' 
                          }}
                        >
                          Sem foto
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <div className="font-medium">{aluno.nome_completo}</div>
                        {aluno.apelido && (
                          <div className="text-sm text-muted-foreground">{aluno.apelido}</div>
                        )}
                      </td>
                      <td className="border px-4 py-2 text-sm">{aluno.email}</td>
                      <td className="border px-4 py-2 font-mono text-sm">{aluno.numero_ficha}</td>
                      <td className="border px-4 py-2 text-sm">{aluno.telefone_principal}</td>
                      <td className="border px-4 py-2 text-sm">{aluno.genero}</td>
                      <td className="border px-4 py-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {aluno.matriculas ? aluno.matriculas.length : 0}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                          onClick={() => navigate(`/admin/student-managements/${aluno.id_aluno}`)}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-foreground py-8">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-2" />
                        <p>Nenhum aluno cadastrado.</p>
                        <button
                          onClick={() => setShowNovoAluno(true)}
                          className="mt-2 text-primary hover:underline"
                        >
                          Cadastrar primeiro aluno
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Novo Aluno */}
        {showNovoAluno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">Novo Aluno</h3>
                <form onSubmit={handleNovoAlunoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input 
                      name="numero_ficha" 
                      value={novoAluno.numero_ficha} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Número da Ficha" 
                      required 
                    />
                    <input 
                      name="nome_completo" 
                      value={novoAluno.nome_completo} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Nome Completo" 
                      required 
                    />
                    <input 
                      name="apelido" 
                      value={novoAluno.apelido} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Apelido" 
                    />
                    <input 
                      name="data_nascimento" 
                      type="date" 
                      value={novoAluno.data_nascimento} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      required 
                    />
                    <select 
                      name="estado_civil" 
                      value={novoAluno.estado_civil} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      required
                    >
                      <option value="">Estado Civil</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                    <input 
                      name="nome_pai" 
                      value={novoAluno.nome_pai} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Nome do Pai" 
                    />
                    <input 
                      name="nome_mae" 
                      value={novoAluno.nome_mae} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Nome da Mãe" 
                    />
                    <input 
                      name="local_nascimento" 
                      value={novoAluno.local_nascimento} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Local de Nascimento" 
                    />
                    <select 
                      name="tipo_identificacao" 
                      value={novoAluno.tipo_identificacao} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      required
                    >
                      <option value="">Tipo de Identificação</option>
                      <option value="BI">BI</option>
                      <option value="Passaporte">Passaporte</option>
                      <option value="Carta de Condução">Carta de Condução</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <input 
                      name="numero_identificacao" 
                      value={novoAluno.numero_identificacao} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Número de Identificação" 
                    />
                    <select 
                      name="pais_origem" 
                      value={novoAluno.pais_origem} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      required
                    >
                      <option value="">País de Origem</option>
                      <option value="Moçambique">Moçambique</option>
                      <option value="África do Sul">África do Sul</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Outro">Outro</option>
                    </select>
                    <input 
                      name="profissao" 
                      value={novoAluno.profissao} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Profissão" 
                    />
                    <input 
                      name="endereco" 
                      value={novoAluno.endereco} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Endereço" 
                    />
                    <input 
                      name="numero_casa" 
                      value={novoAluno.numero_casa} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Número da Casa" 
                    />
                    <input 
                      name="telefone_principal" 
                      value={novoAluno.telefone_principal} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Telefone Principal" 
                    />
                    <input 
                      name="telefone_alternativo" 
                      value={novoAluno.telefone_alternativo} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Telefone Alternativo" 
                    />
                    <input 
                      name="email" 
                      type="email"
                      value={novoAluno.email} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      placeholder="Email" 
                      required 
                    />
                    <select 
                      name="genero" 
                      value={novoAluno.genero} 
                      onChange={handleNovoAlunoChange} 
                      className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                      required
                    >
                      <option value="">Selecione o Gênero</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                  
                  <div className="border-t pt-4">
                    <label className="block font-medium mb-2">Foto do Aluno</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoChange} 
                      className="p-3 border rounded-md w-full focus:ring-2 focus:ring-primary/50 focus:border-primary" 
                    />
                    {previewFoto && (
                      <div className="mt-3">
                        <img 
                          src={previewFoto} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 justify-end pt-6 border-t">
                    <button 
                      type="button" 
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors" 
                      onClick={() => {
                        setShowNovoAluno(false);
                        resetNovoAlunoForm();
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-colors flex items-center gap-2" 
                      disabled={submitting}
                    >
                      {submitting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {submitting ? 'Salvando...' : 'Salvar Aluno'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagements;