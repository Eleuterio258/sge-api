import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react";

interface Escola {
  id_escola: number;
  nome_escola: string;
  distrito: string;
  provincia: string;
}

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
  matriculas?: Matricula[];
  nome_pai?: string;
  nome_mae?: string;
  local_nascimento?: string;
  tipo_identificacao?: string;
  numero_identificacao?: string;
  pais_origem?: string;
  profissao?: string;
  endereco?: string;
  numero_casa?: string;
  telefone_alternativo?: string;
  id_escola?: number;
}

interface Matricula {
  id_matricula: number;
  status_matricula: string;
  custo_total_curso: number;
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

const API_URL = "http://18.206.244.149:4000/api/alunos";
const ESCOLAS_URL = "http://18.206.244.149:4000/api/escolas";

const StudentManagements = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showNovoAluno, setShowNovoAluno] = useState(false);
  const [showEditAluno, setShowEditAluno] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [novoAluno, setNovoAluno] = useState<NovoAluno>({
    id_escola: 0,
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

  const [editandoAluno, setEditandoAluno] = useState<NovoAluno>({
    id_escola: 0,
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

  // Function to fetch schools
  const fetchEscolas = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingEscolas(true);
      console.log("Buscando escolas...");

      const response = await axios.get(ESCOLAS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Escolas encontradas:", response.data);

      if (Array.isArray(response.data)) {
        setEscolas(response.data);
        console.log(`${response.data.length} escolas carregadas com sucesso`);
      } else {
        console.error("Formato de resposta inesperado para escolas:", response.data);
        setError("Erro ao carregar lista de escolas");
      }
    } catch (err: unknown) {
      console.error("Erro ao buscar escolas:", err);
      setError("Erro ao carregar escolas. Algumas funcionalidades podem estar limitadas.");
    } finally {
      setLoadingEscolas(false);
    }
  }, [token]);

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

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Resposta da API:", response.data);

      if (Array.isArray(response.data)) {
        setAlunos(response.data);
        console.log(`${response.data.length} alunos carregados com sucesso`);
      } else {
        console.error("Formato de resposta inesperado:", response.data);
        setError("Formato de dados inválido recebido da API");
      }
    } catch (err: unknown) {
      console.error("Erro ao buscar alunos:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number; data?: { message?: string } } };
        if (errorResponse.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else {
          setError(`Erro ao carregar alunos: ${errorResponse.response?.data?.message || 'Erro desconhecido'}`);
        }
      } else {
        setError("Erro ao carregar alunos");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
    fetchEscolas(); // Fetch schools when component mounts
  }, [fetchStudents, fetchEscolas]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewFoto && previewFoto.startsWith('blob:')) {
        URL.revokeObjectURL(previewFoto);
      }
    };
  }, [previewFoto]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNovoAlunoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setNovoAluno((prev) => ({ 
      ...prev, 
      [name]: name === 'id_escola' ? parseInt(value) || 0 : value 
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEditandoAlunoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setEditandoAluno((prev) => ({ 
      ...prev, 
      [name]: name === 'id_escola' ? parseInt(value) || 0 : value 
    }));

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

    // Limpar preview anterior se for blob
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

    // Criar preview temporário
    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://18.206.244.149:4000/api/uploads", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Usar a URL do servidor em vez do blob
      setNovoAluno((prev) => ({ ...prev, foto_url: res.data.url }));
      
      // Limpar o blob URL e usar a URL do servidor
      URL.revokeObjectURL(previewUrl);
      setPreviewFoto(res.data.url);
      
    } catch (err) {
      console.log("Upload endpoint não disponível, usando preview local");
      // Manter o blob URL apenas se o upload falhar
      setNovoAluno((prev) => ({ ...prev, foto_url: previewUrl }));
    }
  };

  const handleEditandoFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpar preview anterior se for blob
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

    // Criar preview temporário
    const previewUrl = URL.createObjectURL(file);
    setPreviewFoto(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://18.206.244.149:4000/api/uploads", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Usar a URL do servidor em vez do blob
      setEditandoAluno((prev) => ({ ...prev, foto_url: res.data.url }));
      
      // Limpar o blob URL e usar a URL do servidor
      URL.revokeObjectURL(previewUrl);
      setPreviewFoto(res.data.url);
      
    } catch (err) {
      console.log("Upload endpoint não disponível, usando preview local");
      // Manter o blob URL apenas se o upload falhar
      setEditandoAluno((prev) => ({ ...prev, foto_url: previewUrl }));
    }
  };

  const validateForm = (data: NovoAluno): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};

    if (!data.id_escola || data.id_escola === 0) errors.id_escola = "Escola é obrigatória";
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
      id_escola: 0,
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
    setError(null);
    setSuccessMessage(null);

    // Limpar blob URLs
    if (previewFoto && previewFoto.startsWith('blob:')) {
      URL.revokeObjectURL(previewFoto);
    }
    setPreviewFoto("");
  }, [previewFoto]);

  const resetEditAlunoForm = useCallback(() => {
    setEditingAluno(null);
    setEditandoAluno({
      id_escola: 0,
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
    setError(null);
    setSuccessMessage(null);

    // Limpar blob URLs
    if (previewFoto && previewFoto.startsWith('blob:')) {
      URL.revokeObjectURL(previewFoto);
    }
    setPreviewFoto("");
  }, [previewFoto]);

  const handleEditAluno = useCallback((aluno: Aluno) => {
    setEditingAluno(aluno);
    setEditandoAluno({
      id_escola: aluno.id_escola || 0,
      numero_ficha: aluno.numero_ficha,
      nome_completo: aluno.nome_completo,
      apelido: aluno.apelido || "",
      data_nascimento: aluno.data_nascimento, // Manter a data original
      estado_civil: aluno.estado_civil,
      nome_pai: aluno.nome_pai || "",
      nome_mae: aluno.nome_mae || "",
      local_nascimento: aluno.local_nascimento || "",
      tipo_identificacao: aluno.tipo_identificacao || "",
      numero_identificacao: aluno.numero_identificacao || "",
      pais_origem: aluno.pais_origem || "",
      profissao: aluno.profissao || "",
      endereco: aluno.endereco || "",
      numero_casa: aluno.numero_casa || "",
      telefone_principal: aluno.telefone_principal,
      telefone_alternativo: aluno.telefone_alternativo || "",
      email: aluno.email,
      genero: aluno.genero,
      foto_url: aluno.foto_url || ""
    });
    setPreviewFoto(aluno.foto_url || "");
    setShowEditAluno(true);
  }, []);

  const handleEditAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAluno) return;

    const validation = validateForm(editandoAluno);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setError("Por favor, corrija os erros no formulário");
      setSuccessMessage(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    try {
      console.log("Atualizando aluno:", editingAluno.id_aluno, editandoAluno);

      const response = await axios.put(`${API_URL}/${editingAluno.id_aluno}`, editandoAluno, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Aluno atualizado com sucesso:", response.data);
      
      const escolaSelecionada = escolas.find(escola => escola.id_escola === editandoAluno.id_escola);
      const nomeEscola = escolaSelecionada ? escolaSelecionada.nome_escola : 'escola selecionada';
      
      setSuccessMessage(`Aluno "${editandoAluno.nome_completo}" foi atualizado com sucesso na ${nomeEscola}!`);
      
      // Wait a bit to show the success message before closing
      setTimeout(() => {
        setShowEditAluno(false);
        resetEditAlunoForm();
        fetchStudents(); // Refresh the list
      }, 2000);

    } catch (err: unknown) {
      console.error("Erro ao atualizar aluno:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number; data?: { message?: string } } };
        if (errorResponse.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else if (errorResponse.response?.status === 409) {
          setError("Já existe um aluno com este número de ficha ou email.");
        } else if (errorResponse.response?.status === 400) {
          setError("Dados inválidos. Verifique os campos obrigatórios.");
        } else if (errorResponse.response?.status === 404) {
          setError("Aluno não encontrado.");
        } else {
          setError(`Erro ao atualizar aluno: ${errorResponse.response?.data?.message || 'Erro desconhecido'}`);
        }
      } else {
        setError("Erro ao atualizar aluno");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAluno = async (alunoId: number, alunoNome: string) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o aluno "${alunoNome}"?\n\nEsta ação não pode ser desfeita e irá remover todas as informações relacionadas ao aluno.`
    );

    if (!confirmDelete) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      console.log("Excluindo aluno:", alunoId);

      const response = await axios.delete(`${API_URL}/${alunoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Aluno excluído com sucesso:", response.data);
      
      setSuccessMessage(`Aluno "${alunoNome}" foi excluído com sucesso!`);
      
      // Refresh the list
      fetchStudents();

    } catch (err: unknown) {
      console.error("Erro ao excluir aluno:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number; data?: { message?: string } } };
        if (errorResponse.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else if (errorResponse.response?.status === 404) {
          setError("Aluno não encontrado.");
        } else if (errorResponse.response?.status === 403) {
          setError("Você não tem permissão para excluir este aluno.");
        } else {
          setError(`Erro ao excluir aluno: ${errorResponse.response?.data?.message || 'Erro desconhecido'}`);
        }
      } else {
        setError("Erro ao excluir aluno");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNovoAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(novoAluno);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setError("Por favor, corrija os erros no formulário");
      setSuccessMessage(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    try {
      console.log("Criando novo aluno:", novoAluno);

      const response = await axios.post(API_URL, novoAluno, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Aluno criado com sucesso:", response.data);
      
      const escolaSelecionada = escolas.find(escola => escola.id_escola === novoAluno.id_escola);
      const nomeEscola = escolaSelecionada ? escolaSelecionada.nome_escola : 'escola selecionada';
      
      setSuccessMessage(`Aluno "${novoAluno.nome_completo}" foi cadastrado com sucesso na ${nomeEscola}!`);
      
      // Wait a bit to show the success message before closing
      setTimeout(() => {
        setShowNovoAluno(false);
        resetNovoAlunoForm();
        fetchStudents(); // Refresh the list
      }, 2000);

    } catch (err: unknown) {
      console.error("Erro ao criar aluno:", err);

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number; data?: { message?: string } } };
        if (errorResponse.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente.");
        } else if (errorResponse.response?.status === 409) {
          setError("Já existe um aluno com este número de ficha ou email.");
        } else if (errorResponse.response?.status === 400) {
          setError("Dados inválidos. Verifique os campos obrigatórios.");
        } else {
          setError(`Erro ao criar aluno: ${errorResponse.response?.data?.message || 'Erro desconhecido'}`);
        }
      } else {
        setError("Erro ao criar aluno");
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

  // Função para formatar data para input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    
    try {
      let date: Date;
      
      // Se a data já está no formato YYYY-MM-DD, retornar diretamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Tentar criar a data
      date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        // Tentar diferentes formatos de data
        const dateFormats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
        ];
        
        for (const format of dateFormats) {
          const match = dateString.match(format);
          if (match) {
            if (format.source.includes('YYYY')) {
              // Formato com ano no final
              const [, day, month, year] = match;
              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              // Formato com ano no início
              const [, year, month, day] = match;
              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            break;
          }
        }
        
        if (isNaN(date.getTime())) {
          return "";
        }
      }
      
      // Formatar para YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  // Função para verificar se o aluno tem matrículas ativas
  const hasActiveMatriculas = (aluno: Aluno): boolean => {
    if (!aluno.matriculas || aluno.matriculas.length === 0) {
      return false;
    }
    
    // Verificar se há matrículas com status ativo
    const activeMatriculas = aluno.matriculas.filter(
      matricula => matricula.status_matricula === 'Ativa' || 
                   matricula.status_matricula === 'Em andamento' ||
                   matricula.status_matricula === 'Ativo'
    );
    
    return activeMatriculas.length > 0;
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

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Sucesso</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
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
                        <div className="flex gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            onClick={() => navigate(`/admin/student-managements/${aluno.id_aluno}`)}
                            title="Ver detalhes"
                          >
                            <span>Ver</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                            onClick={() => handleEditAluno(aluno)}
                            title="Editar aluno"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          {!hasActiveMatriculas(aluno) && (
                            <button
                              className="inline-flex items-center gap-1 rounded-md bg-red-600 text-white hover:bg-red-700 px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              onClick={() => handleDeleteAluno(aluno.id_aluno, aluno.nome_completo)}
                              title="Excluir aluno"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Excluir</span>
                            </button>
                          )}
                          {hasActiveMatriculas(aluno) && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 cursor-help"
                              title="Não é possível excluir alunos com matrículas ativas"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Bloqueado</span>
                            </span>
                          )}
                        </div>
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
                
                {/* Messages in Modal */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleNovoAlunoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* School Selector - First field */}
                    <div className="md:col-span-2 lg:col-span-3">
                      <select
                        name="id_escola"
                        value={novoAluno.id_escola}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.id_escola ? 'border-red-500' : ''}`}
                        required
                        disabled={loadingEscolas}
                      >
                        <option value="">
                          {loadingEscolas ? 'Carregando escolas...' : 'Selecione a Escola *'}
                        </option>
                        {escolas.map((escola) => (
                          <option key={escola.id_escola} value={escola.id_escola}>
                            {escola.nome_escola} - {escola.distrito}, {escola.provincia}
                          </option>
                        ))}
                      </select>
                      {validationErrors.id_escola && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.id_escola}</p>
                      )}
                      {escolas.length === 0 && !loadingEscolas && (
                        <p className="text-yellow-600 text-xs mt-1">
                          Nenhuma escola disponível. Verifique suas permissões.
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        name="numero_ficha"
                        value={novoAluno.numero_ficha}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.numero_ficha ? 'border-red-500' : ''}`}
                        placeholder="Número da Ficha *"
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
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.nome_completo ? 'border-red-500' : ''}`}
                        placeholder="Nome Completo *"
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
                        value={formatDateForInput(novoAluno.data_nascimento)}
                        onChange={handleNovoAlunoChange}
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.data_nascimento ? 'border-red-500' : ''}`}
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
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.estado_civil ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Estado Civil *</option>
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
                        className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.tipo_identificacao ? 'border-red-500' : ''}`}
                        required
                     >
                       <option value="">Tipo de Identificação *</option>
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
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Número de Identificação"
                     />
                   </div>

                   <div>
                     <select
                       name="pais_origem"
                       value={novoAluno.pais_origem}
                       onChange={handleNovoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.pais_origem ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">País de Origem *</option>
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
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.telefone_principal ? 'border-red-500' : ''}`}
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
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.email ? 'border-red-500' : ''}`}
                       placeholder="Email *"
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
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.genero ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">Selecione o Gênero *</option>
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
                     disabled={submitting}
                   >
                     Cancelar
                   </button>
                   <button
                     type="submit"
                     className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={submitting || escolas.length === 0}
                   >
                     {submitting && (
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     )}
                     {submitting ? 'Salvando...' : 'Salvar Aluno'}
                   </button>
                 </div>
                 
                 {escolas.length === 0 && (
                   <div className="text-center text-red-600 text-sm mt-2">
                     Não é possível cadastrar alunos sem escolas disponíveis.
                   </div>
                 )}
               </form>
             </div>
           </div>
         </div>
       )}

       {showEditAluno && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <h3 className="text-xl font-bold mb-4 text-foreground">Editar Aluno</h3>
               
               {/* Messages in Modal */}
               {error && (
                 <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                   <div className="flex items-center">
                     <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                     <p className="text-sm text-red-700">{error}</p>
                   </div>
                 </div>
               )}

               {successMessage && (
                 <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                   <div className="flex items-center">
                     <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                     <p className="text-sm text-green-700">{successMessage}</p>
                   </div>
                 </div>
               )}

               <form onSubmit={handleEditAlunoSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {/* School Selector - First field */}
                   <div className="md:col-span-2 lg:col-span-3">
                     <select
                       name="id_escola"
                       value={editandoAluno.id_escola}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.id_escola ? 'border-red-500' : ''}`}
                       required
                       disabled={loadingEscolas}
                     >
                       <option value="">
                         {loadingEscolas ? 'Carregando escolas...' : 'Selecione a Escola *'}
                       </option>
                       {escolas.map((escola) => (
                         <option key={escola.id_escola} value={escola.id_escola}>
                           {escola.nome_escola} - {escola.distrito}, {escola.provincia}
                         </option>
                       ))}
                     </select>
                     {validationErrors.id_escola && (
                       <p className="text-red-500 text-xs mt-1">{validationErrors.id_escola}</p>
                     )}
                     {escolas.length === 0 && !loadingEscolas && (
                       <p className="text-yellow-600 text-xs mt-1">
                         Nenhuma escola disponível. Verifique suas permissões.
                       </p>
                     )}
                   </div>

                   <div>
                     <input
                       name="numero_ficha"
                       value={editandoAluno.numero_ficha}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.numero_ficha ? 'border-red-500' : ''}`}
                       placeholder="Número da Ficha *"
                       required
                     />
                     {validationErrors.numero_ficha && (
                       <p className="text-red-500 text-xs mt-1">{validationErrors.numero_ficha}</p>
                     )}
                   </div>

                   <div>
                     <input
                       name="nome_completo"
                       value={editandoAluno.nome_completo}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.nome_completo ? 'border-red-500' : ''}`}
                       placeholder="Nome Completo *"
                       required
                     />
                     {validationErrors.nome_completo && (
                       <p className="text-red-500 text-xs mt-1">{validationErrors.nome_completo}</p>
                     )}
                   </div>

                   <div>
                     <input
                       name="apelido"
                       value={editandoAluno.apelido}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Apelido"
                     />
                   </div>

                   <div>
                     <input
                       name="data_nascimento"
                       type="date"
                       value={formatDateForInput(editandoAluno.data_nascimento)}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.data_nascimento ? 'border-red-500' : ''}`}
                       required
                     />
                     {validationErrors.data_nascimento && (
                       <p className="text-red-500 text-xs mt-1">{validationErrors.data_nascimento}</p>
                     )}
                   </div>

                   <div>
                     <select
                       name="estado_civil"
                       value={editandoAluno.estado_civil}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.estado_civil ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">Estado Civil *</option>
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
                       value={editandoAluno.nome_pai}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Nome do Pai"
                     />
                   </div>

                   <div>
                     <input
                       name="nome_mae"
                       value={editandoAluno.nome_mae}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Nome da Mãe"
                     />
                   </div>

                   <div>
                     <input
                       name="local_nascimento"
                       value={editandoAluno.local_nascimento}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Local de Nascimento"
                     />
                   </div>

                   <div>
                     <select
                       name="tipo_identificacao"
                       value={editandoAluno.tipo_identificacao}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.tipo_identificacao ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">Tipo de Identificação *</option>
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
                       value={editandoAluno.numero_identificacao}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Número de Identificação"
                     />
                   </div>

                   <div>
                     <select
                       name="pais_origem"
                       value={editandoAluno.pais_origem}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.pais_origem ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">País de Origem *</option>
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
                       value={editandoAluno.profissao}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Profissão"
                     />
                   </div>

                   <div>
                     <input
                       name="endereco"
                       value={editandoAluno.endereco}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Endereço"
                     />
                   </div>

                   <div>
                     <input
                       name="numero_casa"
                       value={editandoAluno.numero_casa}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Número da Casa"
                     />
                   </div>

                   <div>
                     <input
                       name="telefone_principal"
                       value={editandoAluno.telefone_principal}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.telefone_principal ? 'border-red-500' : ''}`}
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
                       value={editandoAluno.telefone_alternativo}
                       onChange={handleEditandoAlunoChange}
                       className="p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
                       placeholder="Telefone Alternativo"
                     />
                   </div>

                   <div>
                     <input
                       name="email"
                       type="email"
                       value={editandoAluno.email}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.email ? 'border-red-500' : ''}`}
                       placeholder="Email *"
                       required
                     />
                     {validationErrors.email && (
                       <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                     )}
                   </div>

                   <div>
                     <select
                       name="genero"
                       value={editandoAluno.genero}
                       onChange={handleEditandoAlunoChange}
                       className={`p-3 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary w-full ${validationErrors.genero ? 'border-red-500' : ''}`}
                       required
                     >
                       <option value="">Selecione o Gênero *</option>
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
                     onChange={handleEditandoFotoChange}
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
                       setShowEditAluno(false);
                       resetEditAlunoForm();
                     }}
                     disabled={submitting}
                   >
                     Cancelar
                   </button>
                   <button
                     type="submit"
                     className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={submitting || escolas.length === 0}
                   >
                     {submitting && (
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     )}
                     {submitting ? 'Salvando...' : 'Salvar Aluno'}
                   </button>
                 </div>
                 
                 {escolas.length === 0 && (
                   <div className="text-center text-red-600 text-sm mt-2">
                     Não é possível cadastrar alunos sem escolas disponíveis.
                   </div>
                 )}
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