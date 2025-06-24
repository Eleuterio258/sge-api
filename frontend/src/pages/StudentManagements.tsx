import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Aluno {
  id_aluno: number;
  numero_ficha: string;
  nome_completo: string;
  email: string;
  foto_url?: string;
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

const StudentManagements: React.FC = () => {
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
  const { accessToken, isTokenValid } = useAuth();

  useEffect(() => {
    if (!accessToken || !isTokenValid()) {
      setError("Token de acesso inválido ou expirado. Faça login novamente.");
      setLoading(false);
      return;
    }
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setAlunos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao buscar alunos");
        setLoading(false);
      });
  }, [accessToken, isTokenValid]);

  const handleNovoAlunoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoAluno((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview local
    setPreviewFoto(URL.createObjectURL(file));
    // Simulação de upload para API
    const formData = new FormData();
    formData.append("file", file);
    try {
      // Substitua a URL abaixo pela rota real de upload se existir
      const res = await axios.post("http://localhost:4000/api/uploads", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setNovoAluno((prev) => ({ ...prev, foto_url: res.data.url }));
    } catch (err) {
      // Se não houver endpoint, apenas mantenha o preview local
      setNovoAluno((prev) => ({ ...prev, foto_url: previewFoto }));
    }
  };

  const handleNovoAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(API_URL, novoAluno, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setShowNovoAluno(false);
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
      // Atualizar lista
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAlunos(res.data);
      setLoading(false);
    } catch (err) {
      setError("Erro ao criar aluno");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-5xl bg-card rounded-lg shadow border p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-1">Gestão de Alunos</h1>
            <p className="text-muted-foreground text-lg">Visualize e gerencie os alunos cadastrados no sistema</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors"
            onClick={() => setShowNovoAluno(true)}
          >
            Novo Aluno
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
                    <td className="border px-4 py-2">
                  <button
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={() => navigate(`/admin/student-managements/${aluno.id_aluno}`)}
                  >
                    Ver detalhes
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
        {/* Modal Novo Aluno */}
        {showNovoAluno && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4 text-foreground">Novo Aluno</h3>
              <form onSubmit={handleNovoAlunoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="numero_ficha" value={novoAluno.numero_ficha} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Número da Ficha" required />
                  <input name="nome_completo" value={novoAluno.nome_completo} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Nome Completo" required />
                  <input name="apelido" value={novoAluno.apelido} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Apelido" />
                  <input name="data_nascimento" type="date" value={novoAluno.data_nascimento} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Data de Nascimento" required />
                  <select name="estado_civil" value={novoAluno.estado_civil} onChange={handleNovoAlunoChange} className="p-2 border rounded" required>
                    <option value="">Estado Civil</option>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
                  <input name="nome_pai" value={novoAluno.nome_pai} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Nome do Pai" />
                  <input name="nome_mae" value={novoAluno.nome_mae} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Nome da Mãe" />
                  <input name="local_nascimento" value={novoAluno.local_nascimento} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Local de Nascimento" />
                  <select name="tipo_identificacao" value={novoAluno.tipo_identificacao} onChange={handleNovoAlunoChange} className="p-2 border rounded" required>
                    <option value="">Tipo de Identificação</option>
                    <option value="BI">BI</option>
                    <option value="Passaporte">Passaporte</option>
                    <option value="Carta de Condução">Carta de Condução</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <input name="numero_identificacao" value={novoAluno.numero_identificacao} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Número de Identificação" />
                  <select name="pais_origem" value={novoAluno.pais_origem} onChange={handleNovoAlunoChange} className="p-2 border rounded" required>
                    <option value="">País de Origem</option>
                    <option value="Moçambique">Moçambique</option>
                    <option value="África do Sul">África do Sul</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <input name="profissao" value={novoAluno.profissao} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Profissão" />
                  <input name="endereco" value={novoAluno.endereco} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Endereço" />
                  <input name="numero_casa" value={novoAluno.numero_casa} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Número da Casa" />
                  <input name="telefone_principal" value={novoAluno.telefone_principal} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Telefone Principal" />
                  <input name="telefone_alternativo" value={novoAluno.telefone_alternativo} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Telefone Alternativo" />
                  <input name="email" value={novoAluno.email} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="Email" required />
                  <select name="genero" value={novoAluno.genero} onChange={handleNovoAlunoChange} className="p-2 border rounded" required>
                    <option value="">Selecione o Gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  <input name="foto_url" value={novoAluno.foto_url} onChange={handleNovoAlunoChange} className="p-2 border rounded" placeholder="URL da Foto" style={{ display: 'none' }} />
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Foto do Aluno</label>
                    <input type="file" accept="image/*" onChange={handleFotoChange} className="p-2 border rounded" />
                    {previewFoto && (
                      <img src={previewFoto} alt="Preview" className="w-20 h-20 rounded-full object-cover border mt-2" />
                    )}
                  </div>
                </div>
                <div className="flex gap-4 justify-end mt-4">
                  <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setShowNovoAluno(false)}>
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

export default StudentManagements; 