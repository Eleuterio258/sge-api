import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

// Utilitários de validação para documentos moçambicanos
const validationUtils = {


  validatePassport: (passport: string): { isValid: boolean; message?: string } => {
    const cleanPassport = passport.replace(/\s+/g, '').toUpperCase();

    if (!cleanPassport) {
      return { isValid: false, message: "Número do passaporte é obrigatório" };
    }

    const oldFormatRegex = /^[A-Z][0-9]{6}$/;
    const newFormatRegex = /^[A-Z]{2}[0-9]{7}$/;
    const biometricRegex = /^MP[0-9]{6}$/;

    if (oldFormatRegex.test(cleanPassport)) {
      return { isValid: true };
    }

    if (newFormatRegex.test(cleanPassport)) {
      return { isValid: true };
    }

    if (biometricRegex.test(cleanPassport)) {
      return { isValid: true };
    }

    return {
      isValid: false,
      message: "Formato inválido. Use: A123456 (antigo), AB1234567 (novo) ou MP123456 (biométrico)"
    };
  },

  formatBI: (value: string): string => {
    const clean = value.replace(/\D/g, '').slice(0, 12);
    const letter = value.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase();
    return clean + letter;
  },

  formatPassport: (value: string): string => {
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }
};

const API_URL = "http://135.181.249.37:4000/api/alunos";

const StudentsPage = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNovoAluno, setShowNovoAluno] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
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

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  // Update the fetchStudents function to handle the nested response
  const fetchStudents = useCallback(async () => {
    if (!token) {
      setError("Token de acesso não encontrado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Buscando alunos...");

      // Use the escolas-atribuidas endpoint
      const response = await axios.get(`${API_URL}/escolas-atribuidas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 100, // Adjust as needed
          search: '',
          status: 'active',
          sortBy: 'created_at',
          sortOrder: 'DESC'
        }
      });

      console.log("Resposta da API:", response.data);

      if (response.data.success && response.data.escolas_alunos) {
        // Flatten the nested structure to get all students
        const allStudents: Aluno[] = response.data.escolas_alunos.reduce((acc: Aluno[], escola: any) => {
          return acc.concat(escola.alunos);
        }, []);

        setAlunos(allStudents);
        console.log(`${allStudents.length} alunos carregados com sucesso`);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError("Formato de dados inválido recebido da API");
      }
    } catch (err: any) {
      console.error("Erro ao buscar alunos:", err);

      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError(`Erro ao carregar alunos: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    return () => {
      if (previewFoto && previewFoto.startsWith('blob:')) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

  const handleNovoAlunoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === 'numero_identificacao') {
      if (novoAluno.tipo_identificacao === 'BI') {
        formattedValue = validationUtils.formatBI(value);
      } else if (novoAluno.tipo_identificacao === 'Passaporte') {
        formattedValue = validationUtils.formatPassport(value);
      }
    }

    setNovoAluno((prev) => ({ ...prev, [name]: formattedValue }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };



  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewFoto && previewFoto.startsWith('blob:')) {
      URL.revokeObjectURL(previewFoto);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Tipo de arquivo inválido. Use: JPEG, PNG, GIF ou WebP");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://135.181.249.37:4000/api/uploads", formData, {
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

  const validateForm = (data: NovoAluno): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};

    if (!data.nome_completo.trim()) errors.nome_completo = "Nome completo é obrigatório";
    if (!data.email.trim()) errors.email = "Email é obrigatório";
    if (!data.numero_ficha.trim()) errors.numero_ficha = "Número da ficha é obrigatório";
    if (!data.data_nascimento) errors.data_nascimento = "Data de nascimento é obrigatória";
    if (!data.genero) errors.genero = "Gênero é obrigatório";
    if (!data.estado_civil) errors.estado_civil = "Estado civil é obrigatório";
    if (!data.tipo_identificacao) errors.tipo_identificacao = "Tipo de identificação é obrigatório";
    if (!data.pais_origem) errors.pais_origem = "País de origem é obrigatório";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.email = "Email inválido";
    }

    if (data.tipo_identificacao && data.numero_identificacao) {
      const identificationError = validateIdentificationNumber(data.tipo_identificacao, data.numero_identificacao);
      if (identificationError) {
        errors.numero_identificacao = identificationError;
      }
    } else if (data.tipo_identificacao) {
      errors.numero_identificacao = "Número de identificação é obrigatório";
    }

    if (data.data_nascimento) {
      const birthDate = new Date(data.data_nascimento);
      const today = new Date();
      if (birthDate > today) {
        errors.data_nascimento = "Data de nascimento não pode ser futura";
      }

      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5) {
        errors.data_nascimento = "Idade mínima é 5 anos";
      }
    }

    const phoneRegex = /^(\+258|258)?[2-8][0-9]{7,8}$/;
    if (data.telefone_principal && !phoneRegex.test(data.telefone_principal.replace(/\s+/g, ''))) {
      errors.telefone_principal = "Formato inválido. Use: +258123456789 ou 258123456789";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const resetNovoAlunoForm = useCallback(() => {
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

    setValidationErrors({});

    if (previewFoto && previewFoto.startsWith('blob:')) {
      URL.revokeObjectURL(previewFoto);
    }
    setPreviewFoto("");
  }, [previewFoto]);

  const handleNovoAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(novoAluno);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setError("Por favor, corrija os erros no formulário");
      return;
    }

    setSubmitting(true);
    setError(null);
    setValidationErrors({});

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

      await fetchStudents();

    } catch (err: any) {
      console.error("Erro ao criar aluno:", err);

      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else if (err.response?.status === 409) {
        setError("Já existe um aluno com este número de ficha ou email.");
      } else {
        setError(`Erro ao criar aluno: ${err.response?.data?.message || err.message}`);
      }
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
                        {aluno.foto_url &&
                          aluno.foto_url !== "http://example.com/aluno.jpg" &&
                          aluno.foto_url !== "http://example.com/maria.jpg" ? (
                          <img
                            src={aluno.foto_url}
                            alt={aluno.nome_completo}
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const span = target.nextElementSibling as HTMLElement;
                              if (span) span.style.display = 'block';
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
                          onClick={() => navigate(`/local-admin/students/${aluno.id_aluno}`)}
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

        {showNovoAluno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">Novo Aluno</h3>
                <form onSubmit={handleNovoAlunoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <input
                        name="numero_ficha"
                        value={novoAluno.numero_ficha}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.numero_ficha ? 'border-red-500' : ''
                          }`}
                        placeholder="Número da Ficha"
                        required
                      />
                      {validationErrors.numero_ficha && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.numero_ficha}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="nome_completo"
                        value={novoAluno.nome_completo}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.nome_completo ? 'border-red-500' : ''
                          }`}
                        placeholder="Nome Completo"
                        required
                      />
                      {validationErrors.nome_completo && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.nome_completo}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="apelido"
                        value={novoAluno.apelido}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Apelido"
                      />
                    </div>

                    <div>
                      <input
                        name="data_nascimento"
                        type="date"
                        value={novoAluno.data_nascimento}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.data_nascimento ? 'border-red-500' : ''
                          }`}
                        required
                      />
                      {validationErrors.data_nascimento && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.data_nascimento}</p>
                      )}
                    </div>

                    <div>
                      <select
                        name="estado_civil"
                        value={novoAluno.estado_civil}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.estado_civil ? 'border-red-500' : ''
                          }`}
                        required
                      >
                        <option value="">Estado Civil</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                      {validationErrors.estado_civil && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.estado_civil}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="nome_pai"
                        value={novoAluno.nome_pai}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Nome do Pai"
                      />
                    </div>

                    <div>
                      <input
                        name="nome_mae"
                        value={novoAluno.nome_mae}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Nome da Mãe"
                      />
                    </div>

                    <div>
                      <input
                        name="local_nascimento"
                        value={novoAluno.local_nascimento}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Local de Nascimento"
                      />
                    </div>

                    <div>
                      <select
                        name="tipo_identificacao"
                        value={novoAluno.tipo_identificacao}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.tipo_identificacao ? 'border-red-500' : ''
                          }`}
                        required
                      >
                        <option value="">Tipo de Identificação</option>
                        <option value="BI">BI (Bilhete de Identidade)</option>
                        <option value="Passaporte">Passaporte</option>
                        <option value="Carta de Condução">Carta de Condução</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {validationErrors.tipo_identificacao && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.tipo_identificacao}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="numero_identificacao"
                        value={novoAluno.numero_identificacao}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.numero_identificacao ? 'border-red-500' : ''
                          }`}
                        placeholder={
                          novoAluno.tipo_identificacao === 'BI'
                            ? "120000000123A"
                            : novoAluno.tipo_identificacao === 'Passaporte'
                              ? "A123456 ou AB1234567"
                              : "Número de Identificação"
                        }
                        maxLength={
                          novoAluno.tipo_identificacao === 'BI' ? 13 :
                            novoAluno.tipo_identificacao === 'Passaporte' ? 9 :
                              undefined
                        }
                      />
                      {validationErrors.numero_identificacao && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.numero_identificacao}</p>
                      )}
                      {novoAluno.tipo_identificacao === 'BI' && (
                        <p className="text-gray-500 text-xs mt-1">
                          Formato: 12 dígitos + 1 letra (ex: 120000000123A)
                        </p>
                      )}
                      {novoAluno.tipo_identificacao === 'Passaporte' && (
                        <p className="text-gray-500 text-xs mt-1">
                          Formato: A123456 (antigo), AB1234567 (novo) ou MP123456 (biométrico)
                        </p>
                      )}
                    </div>

                    <div>
                      <select
                        name="pais_origem"
                        value={novoAluno.pais_origem}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.pais_origem ? 'border-red-500' : ''
                          }`}
                        required
                      >
                        <option value="">País de Origem</option>
                        <option value="Moçambique">Moçambique</option>
                        <option value="África do Sul">África do Sul</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                        <option value="Malawi">Malawi</option>
                        <option value="Tanzânia">Tanzânia</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Brasil">Brasil</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {validationErrors.pais_origem && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.pais_origem}</p>
                      )}
                    </div>

                    <div>
                      <input
                        name="profissao"
                        value={novoAluno.profissao}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Profissão"
                      />
                    </div>

                    <div>
                      <input
                        name="endereco"
                        value={novoAluno.endereco}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Endereço"
                      />
                    </div>

                    <div>
                      <input
                        name="numero_casa"
                        value={novoAluno.numero_casa}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Número da Casa"
                      />
                    </div>

                    <div>
                      <input
                        name="telefone_principal"
                        value={novoAluno.telefone_principal}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.telefone_principal ? 'border-red-500' : ''
                          }`}
                        placeholder="+258123456789"
                      />
                      {validationErrors.telefone_principal && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.telefone_principal}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Formato: +258123456789 ou 258123456789
                      </p>
                    </div>

                    <div>
                      <input
                        name="telefone_alternativo"
                        value={novoAluno.telefone_alternativo}
                        onChange={handleNovoAlunoChange}
                        className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                        placeholder="Telefone Alternativo"
                      />
                    </div>

                    <div>
                      <input
                        name="email"
                        type="email"
                        value={novoAluno.email}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.email ? 'border-red-500' : ''
                          }`}
                        placeholder="Email"
                        required
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <select
                        name="genero"
                        value={novoAluno.genero}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.genero ? 'border-red-500' : ''
                          }`}
                        required
                      >
                        <option value="">Selecione o Gênero</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                      {validationErrors.genero && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.genero}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block font-medium mb-2">Foto do Aluno</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="p-3 border rounded-md w-full focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Tamanho máximo: 5MB. Formatos aceitos: JPEG, PNG, GIF, WebP
                    </p>
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

export default StudentsPage;