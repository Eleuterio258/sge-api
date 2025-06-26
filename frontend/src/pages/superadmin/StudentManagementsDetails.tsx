import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Aluno, Matricula, Escola, CategoriaCartaConducao, NovaMatriculaData, Parcela, DetalhesPagamento } from "../../types/studentManagements";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const API_URL = "http://18.206.244.149:4000/api/alunos";
const MATRICULAS_API_URL = "http://18.206.244.149:4000/api/matriculas";
const ESCOLAS_API_URL = "http://18.206.244.149:4000/api/escolas";
const CATEGORIAS_API_URL = "http://18.206.244.149:4000/api/categorias-carta";

// Interface para a API de categorias
interface CategoriaCartaConducaoAPI {
  id_categoria: number;
  codigo_categoria: string;
  descricao: string;
  preco: string;
}

const StudentManagementsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, isTokenValid } = useAuth();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCartaConducao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatriculaForm, setShowMatriculaForm] = useState<boolean>(false);
  const [submittingMatricula, setSubmittingMatricula] = useState<boolean>(false);

  const [novaMatricula, setNovaMatricula] = useState<NovaMatriculaData>({
    id_escola: 0,
    id_categoria_carta: 0,
    data_inicio_curso: '',
    horario_inicio_curso: '08:00',
    duracao_contrato_meses: 3,
    custo_total_curso: '',
    numero_parcelas: 1,
    valor_primeira_parcela: 0,
    observacoes: ''
  });

  const [parcelaParaPagar, setParcelaParaPagar] = useState<Parcela | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [detalhesPagamento, setDetalhesPagamento] = useState<DetalhesPagamento | null>(null);

  // Constante para taxa de serviço
  const TAXA_SERVICO = 600;

  // Função para processar matrículas e evitar duplicação
  const processMatriculas = useCallback((matriculasData: Matricula[]): Matricula[] => {
    if (!Array.isArray(matriculasData)) return [];

    return matriculasData.map((matricula: Matricula) => {
      // Garantir que as parcelas não estão duplicadas
      const parcelasUnicas = matricula.parcelas?.reduce((acc: Parcela[], parcela: Parcela) => {
        // Verificar se a parcela já existe no array
        const parcelaExistente = acc.find(p => p.id_parcela === parcela.id_parcela);
        if (!parcelaExistente) {
          acc.push({
            ...parcela,
            id_matricula: matricula.id_matricula
          });
        }
        return acc;
      }, []) || [];

      return {
        ...matricula,
        parcelas: parcelasUnicas
      };
    });
  }, []);

  // Função para buscar matrículas com melhor tratamento de erro
  const fetchMatriculas = useCallback(async () => {
    if (!id || !accessToken) return;

    try {
      const matriculasResponse = await axios.get(`${MATRICULAS_API_URL}/aluno/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const matriculasProcessadas = processMatriculas(matriculasResponse.data || []);
      setMatriculas(matriculasProcessadas);
    } catch (matriculasError: unknown) {
      if (axios.isAxiosError(matriculasError)) {
        if (matriculasError.response?.status === 404) {
          // Se não encontrar matrículas, definir array vazio
          setMatriculas([]);
          console.log('Nenhuma matrícula encontrada para este aluno');
        } else {
          console.error('Erro ao buscar matrículas:', matriculasError.response?.data);
          // Para outros erros, também definir array vazio para não quebrar a interface
          setMatriculas([]);
        }
      } else {
        console.error('Erro desconhecido ao buscar matrículas:', matriculasError);
        setMatriculas([]);
      }
    }
  }, [id, accessToken, processMatriculas]);

  useEffect(() => {
    if (!accessToken || !isTokenValid()) {
      setError("Token de acesso inválido ou expirado. Faça login novamente.");
      setLoading(false);
      return;
    }

    if (!id) {
      setError("ID do aluno não fornecido.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar detalhes do aluno
        const alunoResponse = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAluno(alunoResponse.data);

        // Buscar matrículas do aluno (com tratamento de erro melhorado)
        await fetchMatriculas();

        // Buscar escolas e categorias para o formulário de matrícula
        const [escolasResponse, categoriasResponse] = await Promise.all([
          axios.get(ESCOLAS_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axios.get(CATEGORIAS_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        setEscolas(escolasResponse.data || []);
        setCategorias(
          ((categoriasResponse.data || []) as CategoriaCartaConducaoAPI[]).map((cat) => ({
            id_categoria: cat.id_categoria,
            nome_categoria: cat.codigo_categoria,
            descricao: cat.descricao,
            preco_base: cat.preco,
          }))
        );

      } catch (err: unknown) {
        console.error("Erro ao buscar dados:", err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Token de acesso expirado. Faça login novamente.");
          } else if (err.response?.status === 404) {
            setError("Aluno não encontrado.");
          } else {
            setError(`Erro ao buscar detalhes do aluno: ${err.response?.data?.message || err.message}`);
          }
        } else {
          setError("Erro ao buscar detalhes do aluno. Tente novamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, accessToken, isTokenValid, fetchMatriculas]);

  // Função para calcular o total com taxa de serviço
  const calcularTotalComTaxa = (custoCurso: string | number): number => {
    const custo = typeof custoCurso === 'string' ? parseFloat(custoCurso) : custoCurso;
    return isNaN(custo) ? TAXA_SERVICO : custo + TAXA_SERVICO;
  };

  const handleCategoriaChange = (categoriaId: number) => {
    const categoria = categorias.find(c => c.id_categoria === categoriaId);
    if (categoria) {
      const custoBase = parseFloat(categoria.preco_base);
      const totalComTaxa = calcularTotalComTaxa(custoBase);

      setNovaMatricula(prev => ({
        ...prev,
        id_categoria_carta: categoriaId,
        custo_total_curso: totalComTaxa.toString(),
        // Se for pagamento total, o valor da primeira parcela é o total
        // Se for parcelado, deixar para o usuário definir
        valor_primeira_parcela: prev.numero_parcelas === 1 ? totalComTaxa : 0
      }));
    }
  };

  // Função para lidar com mudança no número de parcelas
  const handleNumeroParcelasChange = (numeroParcelas: number) => {
    const totalComTaxa = parseFloat(novaMatricula.custo_total_curso) || 0;

    setNovaMatricula(prev => ({
      ...prev,
      numero_parcelas: numeroParcelas,
      // Se for pagamento total (1x), o valor da primeira parcela é o total
      // Se for parcelado, deixar o campo vazio para o usuário preencher
      valor_primeira_parcela: numeroParcelas === 1 ? totalComTaxa : 0
    }));
  };

  // Função para validar dados da matrícula
  const validarDadosMatricula = (): string | null => {
    if (!novaMatricula.id_escola || novaMatricula.id_escola === 0) {
      return "Selecione uma escola";
    }
    if (!novaMatricula.id_categoria_carta || novaMatricula.id_categoria_carta === 0) {
      return "Selecione uma categoria da carta";
    }
    if (!novaMatricula.data_inicio_curso) {
      return "Informe a data de início do curso";
    }
    if (!novaMatricula.horario_inicio_curso) {
      return "Informe o horário de início do curso";
    }
    if (!novaMatricula.custo_total_curso || parseFloat(novaMatricula.custo_total_curso) <= 0) {
      return "Custo total do curso inválido";
    }
    if (novaMatricula.numero_parcelas > 1) {
      if (!novaMatricula.valor_primeira_parcela || novaMatricula.valor_primeira_parcela <= 0) {
        return "Informe o valor da primeira parcela";
      }
      const totalComTaxa = parseFloat(novaMatricula.custo_total_curso);
      if (novaMatricula.valor_primeira_parcela > totalComTaxa) {
        return "O valor da primeira parcela não pode ser maior que o total";
      }
    }
    return null;
  };

  const handleSubmitMatricula = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aluno) {
      alert('Dados do aluno não carregados');
      return;
    }

    // Validar dados antes de enviar
    const erroValidacao = validarDadosMatricula();
    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }

    setSubmittingMatricula(true);

    try {
      const matriculaData = {
        id_aluno: aluno.id_aluno,
        id_escola: novaMatricula.id_escola,
        id_categoria_carta: novaMatricula.id_categoria_carta,
        data_inicio_curso: novaMatricula.data_inicio_curso,
        horario_inicio_curso: novaMatricula.horario_inicio_curso,
        duracao_contrato_meses: novaMatricula.duracao_contrato_meses,
        custo_total_curso: parseFloat(novaMatricula.custo_total_curso),
        numero_parcelas: novaMatricula.numero_parcelas,
        valor_primeira_parcela: novaMatricula.valor_primeira_parcela,
        observacoes: novaMatricula.observacoes || ''
      };

      console.log('Dados da matrícula a serem enviados:', matriculaData);

      const response = await axios.post(MATRICULAS_API_URL, matriculaData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Resposta da API:', response.data);

      // Recarregar as matrículas usando a função otimizada
      await fetchMatriculas();

      // Resetar formulário
      setNovaMatricula({
        id_escola: 0,
        id_categoria_carta: 0,
        data_inicio_curso: '',
        horario_inicio_curso: '08:00',
        duracao_contrato_meses: 3,
        custo_total_curso: '',
        numero_parcelas: 1,
        valor_primeira_parcela: 0,
        observacoes: ''
      });

      setShowMatriculaForm(false);
      alert('Matrícula criada com sucesso!');

    } catch (err: unknown) {
      console.error("Erro ao criar matrícula:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
        console.error('Detalhes do erro:', err.response?.data);
        alert(`Erro ao criar matrícula: ${errorMessage}`);
      } else {
        alert('Erro ao criar matrícula. Tente novamente.');
      }
    } finally {
      setSubmittingMatricula(false);
    }
  };

  const handlePagarParcela = (parcela: Parcela, matriculaId: number) => {
    console.log('Parcela selecionada:', parcela);
    console.log('ID da matrícula:', matriculaId);

    const parcelaComMatricula = {
      ...parcela,
      id_matricula: matriculaId
    };

    console.log('Parcela com matrícula:', parcelaComMatricula);
    setParcelaParaPagar(parcelaComMatricula);
  };

  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcelaParaPagar) return;

    const dadosPagamento = {
      id_parcela: parcelaParaPagar.id_parcela,
      id_matricula: parcelaParaPagar.id_matricula,
      valor_pago: parseFloat(parcelaParaPagar.valor_devido),
      metodo_pagamento: metodoPagamento,
      observacoes: observacoesPagamento,
    };

    console.log('Dados do pagamento a serem enviados:', dadosPagamento);

    if (!dadosPagamento.id_matricula || !dadosPagamento.id_parcela || !dadosPagamento.metodo_pagamento) {
      alert('Dados incompletos para o pagamento. Verifique os campos obrigatórios.');
      return;
    }

    try {
      const response = await axios.post('http://18.206.244.149:4000/api/pagamentos', dadosPagamento, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      setDetalhesPagamento(response.data.detalhes);
      setParcelaParaPagar(null);
      setMetodoPagamento('');
      setObservacoesPagamento('');

      // Recarregar as matrículas usando a função otimizada
      await fetchMatriculas();

      alert('Pagamento registrado com sucesso!');

    } catch (err: unknown) {
      console.error('Erro ao registrar pagamento:', err);
      if (axios.isAxiosError(err)) {
        console.error('Resposta do erro:', err.response?.data);
        alert(`Erro ao registrar pagamento: ${err.response?.data?.message || err.message}`);
      } else {
        alert('Erro ao registrar pagamento. Tente novamente.');
      }
    }
  };

  const formatCurrency = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null || value === "") return "MZN 0,00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "MZN 0,00";
    return numValue.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Data inválida';
    try {
      return new Date(dateString).toLocaleDateString('pt-MZ');
    } catch {
      return 'Data inválida';
    }
  };

  // Função auxiliar para verificar se a parcela está paga
  const isParcelaPaga = (status: string): boolean => {
    if (!status) return false;
    return status.toLowerCase() === 'paga';
  };

  const getStatusColor = (status: string): string => {
    if (!status) return 'text-gray-600 bg-gray-100';

    switch (status) {
      case 'Paga':
        return 'text-green-600 bg-green-100';
      case 'Pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Parcialmente Paga':
        return 'text-blue-600 bg-blue-100';
      case 'Vencida':
        return 'text-red-600 bg-red-100';
      case 'Ativa':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Verificar se o aluno já tem matrícula
  const alunoTemMatricula = matriculas && matriculas.length > 0;

  // Função para imprimir detalhes do aluno
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalhes do Aluno - ${aluno?.nome_completo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
            .info-item { margin: 5px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .matricula { border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .status { padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
            .status-ativa { background-color: #d1f2eb; color: #0e6251; }
            .status-paga { background-color: #d5f4e6; color: #27ae60; }
            .status-pendente { background-color: #fef9e7; color: #f39c12; }
            .status-vencida { background-color: #fadbd8; color: #c0392b; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .resumo { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .resumo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .resumo-item { text-align: center; }
            .resumo-label { font-size: 12px; color: #666; }
            .resumo-value { font-size: 16px; font-weight: bold; color: #333; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ficha do Aluno</h1>
            <p><strong>Número da Ficha:</strong> ${aluno?.numero_ficha}</p>
            <p><strong>Data de Impressão:</strong> ${new Date().toLocaleDateString('pt-MZ')}</p>
          </div>

          <div class="section">
            <h2>Informações Pessoais</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nome Completo:</span>
                <span class="value">${aluno?.nome_completo}</span>
              </div>
              <div class="info-item">
                <span class="label">Apelido:</span>
                <span class="value">${aluno?.apelido}</span>
              </div>
              <div class="info-item">
                <span class="label">Data de Nascimento:</span>
                <span class="value">${formatDate(aluno?.data_nascimento || '')}</span>
              </div>
              <div class="info-item">
                <span class="label">Gênero:</span>
                <span class="value">${aluno?.genero}</span>
              </div>
              <div class="info-item">
                <span class="label">Estado Civil:</span>
                <span class="value">${aluno?.estado_civil}</span>
              </div>
              <div class="info-item">
                <span class="label">Profissão:</span>
                <span class="value">${aluno?.profissao}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Contato e Identificação</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">${aluno?.email}</span>
              </div>
              <div class="info-item">
                <span class="label">Telefone Principal:</span>
                <span class="value">${aluno?.telefone_principal}</span>
              </div>
              ${aluno?.telefone_alternativo ? `
              <div class="info-item">
                <span class="label">Telefone Alternativo:</span>
                <span class="value">${aluno.telefone_alternativo}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="label">Endereço:</span>
                <span class="value">${aluno?.endereco}, ${aluno?.numero_casa}</span>
              </div>
              <div class="info-item">
                <span class="label">Identificação:</span>
                <span class="value">${aluno?.tipo_identificacao} - ${aluno?.numero_identificacao}</span>
              </div>
              <div class="info-item">
                <span class="label">País de Origem:</span>
                <span class="value">${aluno?.pais_origem}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Informações Familiares</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Local de Nascimento:</span>
                <span class="value">${aluno?.local_nascimento}</span>
              </div>
              <div class="info-item">
                <span class="label">Nome do Pai:</span>
                <span class="value">${aluno?.nome_pai}</span>
              </div>
              <div class="info-item">
                <span class="label">Nome da Mãe:</span>
                <span class="value">${aluno?.nome_mae}</span>
              </div>
            </div>
          </div>

          ${matriculas && matriculas.length > 0 ? `
          <div class="section">
            <h2>Matrículas</h2>
            ${matriculas.map((matricula, index) => `
              <div class="matricula">
                <h3>Matrícula #${matricula.id_matricula}</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Status:</span>
                    <span class="status status-${matricula.status_matricula?.toLowerCase()}">${matricula.status_matricula}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Data de Matrícula:</span>
                    <span class="value">${formatDate(matricula.data_matricula)}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Início do Curso:</span>
                    <span class="value">${formatDate(matricula.data_inicio_curso)}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Horário:</span>
                    <span class="value">${matricula.horario_inicio_curso}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Duração:</span>
                    <span class="value">${matricula.duracao_contrato_meses} meses</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Custo Total:</span>
                    <span class="value">${formatCurrency(matricula.custo_total_curso)}</span>
                  </div>
                </div>

                ${matricula.resumo_financeiro ? `
                <div class="resumo">
                  <h4>Resumo Financeiro</h4>
                  <div class="resumo-grid">
                    <div class="resumo-item">
                      <div class="resumo-label">Valor Total</div>
                      <div class="resumo-value">${formatCurrency(matricula.resumo_financeiro.valor_total)}</div>
                    </div>
                    <div class="resumo-item">
                      <div class="resumo-label">Valor Pago</div>
                      <div class="resumo-value" style="color: #27ae60;">${formatCurrency(matricula.resumo_financeiro.valor_pago)}</div>
                    </div>
                    <div class="resumo-item">
                      <div class="resumo-label">Valor Pendente</div>
                      <div class="resumo-value" style="color: #c0392b;">${formatCurrency(matricula.resumo_financeiro.valor_pendente)}</div>
                    </div>
                    <div class="resumo-item">
                      <div class="resumo-label">% Pago</div>
                      <div class="resumo-value">${matricula.resumo_financeiro.percentual_pago}%</div>
                    </div>
                  </div>
                </div>
                ` : ''}

                ${matricula.parcelas && matricula.parcelas.length > 0 ? `
                <div>
                  <h4>Parcelas</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Parcela</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${matricula.parcelas.map((parcela: Parcela) => `
                        <tr>
                          <td>#${parcela.numero_parcela}</td>
                          <td>${formatDate(parcela.data_vencimento)}</td>
                          <td>${formatCurrency(parcela.valor_devido)}</td>
                          <td>
                            <span class="status status-${parcela.status_parcela?.toLowerCase()}">${parcela.status_parcela}</span>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          ` : `
          <div class="section">
            <h2>Matrículas</h2>
            <p>Nenhuma matrícula encontrada para este aluno.</p>
          </div>
          `}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Função para imprimir PDF da ficha do aluno (FRENTE E VERSO - A4 DIVIDIDO AO MEIO)
  const handlePrintPDF = async () => {
    if (!aluno) return;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const black = rgb(0, 0, 0);
    const lightYellow = rgb(0.98, 0.97, 0.91); // Cor de fundo #f9f7e8
    const lightBeige = rgb(0.96, 0.95, 0.88); // Cor da seção curso #f5f3e0

    // Dividir a página ao meio
    const halfHeight = height / 2;
    const margin = 15;

    // --- METADE SUPERIOR (FRENTE) ---

    // Fundo da metade superior
    page.drawRectangle({
      x: margin,
      y: halfHeight,
      width: width - (margin * 2),
      height: halfHeight - margin,
      color: lightYellow,
      borderColor: black,
      borderWidth: 2,
    });

    // --- TÍTULO PRINCIPAL (FRENTE) ---
    page.drawText('ESCOLA DE CONDUÇÃO R. GARCIA', {
      x: (width - font.widthOfTextAtSize('ESCOLA DE CONDUÇÃO R. GARCIA', 18)) / 2,
      y: height - 40,
      size: 18,
      font: fontBold,
      color: black,
    });

    // --- CAIXA DA FOTO (canto superior direito) ---
    page.drawRectangle({
      x: width - 120,
      y: height - 120,
      width: 80,
      height: 100,
      borderColor: black,
      borderWidth: 2,
      color: rgb(1, 1, 1), // Branco
    });

    // Helper para linhas pontilhadas
    const drawDottedLine = (x: number, y: number, length: number) => {
      const dotSize = 1.5;
      const gapSize = 1.5;
      let currentX = x;

      while (currentX < x + length) {
        const dotEnd = Math.min(currentX + dotSize, x + length);
        page.drawLine({
          start: { x: currentX, y },
          end: { x: dotEnd, y },
          thickness: 0.8,
          color: black,
        });
        currentX += dotSize + gapSize;
      }
    };

    // Helper para campos com linha pontilhada
    const drawField = (label: string, value: string, x: number, y: number, lineLength: number = 100) => {
      // Label
      page.drawText(label, {
        x,
        y,
        size: 10,
        font,
        color: black,
      });

      // Linha pontilhada
      const labelWidth = font.widthOfTextAtSize(label, 10);
      const lineStart = x + labelWidth + 3;
      drawDottedLine(lineStart, y - 2, lineLength);

      // Valor (se houver)
      if (value) {
        page.drawText(value, {
          x: lineStart + 3,
          y,
          size: 10,
          font,
          color: black,
        });
      }
    };

    // --- CAMPOS PRINCIPAIS (FRENTE) ---
    let currentY = height - 70;
    const leftMargin = 25;
    const lineSpacing = 16;
    const rightLimit = width - 140; // Limite para não sobrepor a foto

    // Ficha nº
    drawField('Ficha nº', aluno.numero_ficha || '', leftMargin, currentY, 120);
    currentY -= lineSpacing;

    // Apelido
    drawField('Apelido', aluno.apelido || '', leftMargin, currentY, rightLimit - leftMargin - 60);
    currentY -= lineSpacing;

    // Nome
    drawField('Nome', aluno.nome_completo || '', leftMargin, currentY, rightLimit - leftMargin - 50);
    currentY -= lineSpacing;

    // Data de Inscrição
    drawField('Data de Inscrição', '', leftMargin, currentY, 150);
    currentY -= lineSpacing;

    // Data de Nascimento (linha complexa)
    page.drawText('Data de Nascimento', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let xPos = leftMargin + font.widthOfTextAtSize('Data de Nascimento', 10) + 3;
    drawDottedLine(xPos, currentY - 2, 50);
    if (aluno.data_nascimento) {
      const dateStr = formatDate(aluno.data_nascimento);
      page.drawText(dateStr.split('/')[0], { x: xPos + 2, y: currentY, size: 10, font, color: black });
    }
    xPos += 55;

    page.drawText('de', { x: xPos, y: currentY, size: 10, font, color: black });
    xPos += 20;
    drawDottedLine(xPos, currentY - 2, 60);
    if (aluno.data_nascimento) {
      const dateStr = formatDate(aluno.data_nascimento);
      const parts = dateStr.split('/');
      if (parts[1]) {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const monthName = months[parseInt(parts[1]) - 1] || parts[1];
        page.drawText(monthName, { x: xPos + 2, y: currentY, size: 9, font, color: black });
      }
    }
    xPos += 65;

    page.drawText('de', { x: xPos, y: currentY, size: 10, font, color: black });
    xPos += 20;
    drawDottedLine(xPos, currentY - 2, 45);
    if (aluno.data_nascimento) {
      const dateStr = formatDate(aluno.data_nascimento);
      const parts = dateStr.split('/');
      if (parts[2]) {
        page.drawText(parts[2], { x: xPos + 2, y: currentY, size: 10, font, color: black });
      }
    }
    xPos += 50;

    page.drawText('Estado Civil', { x: xPos, y: currentY, size: 10, font, color: black });
    xPos += font.widthOfTextAtSize('Estado Civil', 10) + 3;
    drawDottedLine(xPos, currentY - 2, rightLimit - xPos);
    if (aluno.estado_civil) {
      page.drawText(aluno.estado_civil, { x: xPos + 2, y: currentY, size: 10, font, color: black });
    }
    currentY -= lineSpacing;

    // Filho de... e de
    page.drawText('Filho de', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let filhoX = leftMargin + font.widthOfTextAtSize('Filho de', 10) + 3;
    drawDottedLine(filhoX, currentY - 2, 150);
    if (aluno.nome_pai) {
      page.drawText(aluno.nome_pai, { x: filhoX + 2, y: currentY, size: 10, font, color: black });
    }

    let eDeX = filhoX + 155;
    page.drawText('e de', { x: eDeX, y: currentY, size: 10, font, color: black });
    eDeX += font.widthOfTextAtSize('e de', 10) + 3;
    drawDottedLine(eDeX, currentY - 2, rightLimit - eDeX);
    if (aluno.nome_mae) {
      page.drawText(aluno.nome_mae, { x: eDeX + 2, y: currentY, size: 10, font, color: black });
    }
    currentY -= lineSpacing;

    // Natural de
    drawField('Natural de', aluno.local_nascimento || '', leftMargin, currentY, rightLimit - leftMargin - 80);
    currentY -= lineSpacing;

    // Distrito e Província
    page.drawText('Distrito', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let distritoX = leftMargin + font.widthOfTextAtSize('Distrito', 10) + 3;
    drawDottedLine(distritoX, currentY - 2, 100);

    let provinciaX = distritoX + 105;
    page.drawText('Província de', { x: provinciaX, y: currentY, size: 10, font, color: black });
    provinciaX += font.widthOfTextAtSize('Província de', 10) + 3;
    drawDottedLine(provinciaX, currentY - 2, rightLimit - provinciaX);
    currentY -= lineSpacing;

    // Residente em e Av.
    page.drawText('Residente em', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let residenteX = leftMargin + font.widthOfTextAtSize('Residente em', 10) + 3;
    drawDottedLine(residenteX, currentY - 2, 140);
    if (aluno.endereco) {
      page.drawText(aluno.endereco, { x: residenteX + 2, y: currentY, size: 10, font, color: black });
    }

    let avX = residenteX + 145;
    page.drawText('Av.', { x: avX, y: currentY, size: 10, font, color: black });
    avX += font.widthOfTextAtSize('Av.', 10) + 3;
    drawDottedLine(avX, currentY - 2, rightLimit - avX);
    currentY -= lineSpacing;

    // Nº e Telefones
    page.drawText('Nº', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let numeroX = leftMargin + font.widthOfTextAtSize('Nº', 10) + 3;
    drawDottedLine(numeroX, currentY - 2, 50);
    if (aluno.numero_casa) {
      page.drawText(String(aluno.numero_casa), { x: numeroX + 2, y: currentY, size: 10, font, color: black });
    }

    let telX = numeroX + 55;
    page.drawText('Tel:', { x: telX, y: currentY, size: 10, font, color: black });
    telX += font.widthOfTextAtSize('Tel:', 10) + 3;
    drawDottedLine(telX, currentY - 2, 65);
    if (aluno.telefone_principal) {
      page.drawText(aluno.telefone_principal, { x: telX + 2, y: currentY, size: 10, font, color: black });
    }

    telX += 70;
    page.drawText('/', { x: telX, y: currentY, size: 10, font, color: black });
    telX += 10;
    drawDottedLine(telX, currentY - 2, 65);
    if (aluno.telefone_alternativo) {
      page.drawText(aluno.telefone_alternativo, { x: telX + 2, y: currentY, size: 10, font, color: black });
    }

    telX += 70;
    page.drawText('Tel nº', { x: telX, y: currentY, size: 10, font, color: black });
    telX += font.widthOfTextAtSize('Tel nº', 10) + 3;
    drawDottedLine(telX, currentY - 2, rightLimit - telX);
    currentY -= lineSpacing;

    // Profissão
    drawField('Profissão', aluno.profissao || '', leftMargin, currentY, rightLimit - leftMargin - 70);
    currentY -= lineSpacing;

    // B.I., Arquivo, Emitido
    page.drawText('B.I.nº', { x: leftMargin, y: currentY, size: 10, font, color: black });
    let biX = leftMargin + font.widthOfTextAtSize('B.I.nº', 10) + 3;
    drawDottedLine(biX, currentY - 2, 85);
    if (aluno.numero_identificacao) {
      page.drawText(aluno.numero_identificacao, { x: biX + 2, y: currentY, size: 10, font, color: black });
    }

    let arquivoX = biX + 90;
    page.drawText('Arquivo de', { x: arquivoX, y: currentY, size: 10, font, color: black });
    arquivoX += font.widthOfTextAtSize('Arquivo de', 10) + 3;
    drawDottedLine(arquivoX, currentY - 2, 65);

    let emitidoX = arquivoX + 70;
    page.drawText('Emitido em', { x: emitidoX, y: currentY, size: 10, font, color: black });
    emitidoX += font.widthOfTextAtSize('Emitido em', 10) + 3;
    drawDottedLine(emitidoX, currentY - 2, rightLimit - emitidoX);
    currentY -= lineSpacing;

    // --- SEÇÃO INÍCIO DO CURSO ---
    const cursoY = currentY;
    const cursoHeight = 120;
    const cursoWidth = width - 50;

    // Fundo da seção
    page.drawRectangle({
      x: leftMargin,
      y: cursoY - cursoHeight,
      width: cursoWidth,
      height: cursoHeight,
      color: lightBeige,
      borderColor: black,
      borderWidth: 2,
    });

    // Título da seção
    page.drawText('INÍCIO DO CURSO', {
      x: leftMargin + 10,
      y: cursoY - 20,
      size: 12,
      font: fontBold,
      color: black,
    });

    // Lado esquerdo da seção curso
    let cursoLeftY = cursoY - 40;

    // Data
    drawField('Data', '', leftMargin + 10, cursoLeftY, 120);
    cursoLeftY -= 15;

    // Horário
    page.drawText('Horário:', { x: leftMargin + 10, y: cursoLeftY, size: 10, font, color: black });
    cursoLeftY -= 15;

    // Código de Estrada
    page.drawText('Código de Estrada', { x: leftMargin + 10, y: cursoLeftY, size: 10, font, color: black });
    let codigoX = leftMargin + 10 + font.widthOfTextAtSize('Código de Estrada', 10) + 3;
    drawDottedLine(codigoX, cursoLeftY - 2, 50);
    codigoX += 55;
    page.drawText('às', { x: codigoX, y: cursoLeftY, size: 10, font, color: black });
    codigoX += 20;
    drawDottedLine(codigoX, cursoLeftY - 2, 40);
    codigoX += 45;
    page.drawText('Horas', { x: codigoX, y: cursoLeftY, size: 10, font, color: black });
    cursoLeftY -= 15;

    // Condução
    page.drawText('Condução', { x: leftMargin + 10, y: cursoLeftY, size: 10, font, color: black });
    let conducaoX = leftMargin + 10 + font.widthOfTextAtSize('Condução', 10) + 3;
    drawDottedLine(conducaoX, cursoLeftY - 2, 65);
    conducaoX += 70;
    page.drawText('às', { x: conducaoX, y: cursoLeftY, size: 10, font, color: black });
    conducaoX += 20;
    drawDottedLine(conducaoX, cursoLeftY - 2, 50);
    conducaoX += 55;
    page.drawText('Horas', { x: conducaoX, y: cursoLeftY, size: 10, font, color: black });

    // --- TABELA CLASSE (lado direito) ---
    const tabelaX = leftMargin + 220;
    const tabelaY = cursoY - 30;
    const tabelaWidth = 120;
    const tabelaHeight = 70;

    // Fundo da tabela
    page.drawRectangle({
      x: tabelaX,
      y: tabelaY - tabelaHeight,
      width: tabelaWidth,
      height: tabelaHeight,
      color: rgb(1, 1, 1), // Branco
      borderColor: black,
      borderWidth: 1,
    });

    // Título da tabela
    page.drawText('CLASSE', {
      x: tabelaX + 8,
      y: tabelaY - 12,
      size: 10,
      font: fontBold,
      color: black,
    });

    page.drawText('Códigos da Carta', {
      x: tabelaX + 45,
      y: tabelaY - 12,
      size: 8,
      font,
      color: black,
    });

    // Dados da tabela
    const tabelaLinhas = [
      ['A', '', 'A1', '', '125cc'],
      ['B', '', '', '', '3500 KG'],
      ['C1', '', '', '', '4100 KG'],
      ['C', '', '', '', 'GVM'],
      ['BE', '', 'C1E', '', ''],
      ['CE', '', '', '', '']
    ];

    const cellHeight = 10;
    const cellWidths = [18, 15, 18, 15, 54];

    // Desenhar células
    for (let row = 0; row < tabelaLinhas.length; row++) {
      for (let col = 0; col < tabelaLinhas[row].length; col++) {
        const cellX = tabelaX + cellWidths.slice(0, col).reduce((a, b) => a + b, 0);
        const cellY = tabelaY - 22 - (row * cellHeight);

        // Borda da célula
        page.drawRectangle({
          x: cellX,
          y: cellY - cellHeight,
          width: cellWidths[col],
          height: cellHeight,
          borderColor: black,
          borderWidth: 0.5,
        });

        // Fundo cinza para colunas específicas
        if (col === 1 || col === 3) {
          page.drawRectangle({
            x: cellX,
            y: cellY - cellHeight,
            width: cellWidths[col],
            height: cellHeight,
            color: rgb(0.9, 0.9, 0.9),
          });
        }

        // Texto da célula
        if (tabelaLinhas[row][col]) {
          page.drawText(tabelaLinhas[row][col], {
            x: cellX + 2,
            y: cellY - 7,
            size: 7,
            font,
            color: black,
          });
        }
      }
    }

    // --- SEÇÃO CATEGORIAS PROF. ---
    const categoriasX = tabelaX + 125;
    const categoriasY = tabelaY;
    const categoriasWidth = 80;
    const categoriasHeight = 70;

    page.drawRectangle({
      x: categoriasX,
      y: categoriasY - categoriasHeight,
      width: categoriasWidth,
      height: categoriasHeight,
      color: rgb(1, 1, 1),
      borderColor: black,
      borderWidth: 1,
    });

    page.drawText('Categorias Prof.', {
      x: categoriasX + 8,
      y: categoriasY - 12,
      size: 8,
      font: fontBold,
      color: black,
    });

    const categoriasList = [
      'P Passageiros',
      'D Carga / Gondola',
      'D Carga perigosa',
      'M1 Propulsão elétrica',
      'M2 Autocarro',
      'M3 Só tractor',
      'M4 Só Indústria agrícola'
    ];

    let catY = categoriasY - 22;
    categoriasList.forEach(cat => {
      page.drawText(cat, {
        x: categoriasX + 3,
        y: catY,
        size: 6,
        font,
        color: black,
      });
      catY -= 7;
    });

    // --- LINHA DIVISÓRIA NO MEIO ---
    page.drawLine({
      start: { x: 0, y: halfHeight },
      end: { x: width, y: halfHeight },
      thickness: 2,
      color: black,
      dashArray: [5, 5], // Linha tracejada para corte
    });

    // --- METADE INFERIOR (VERSO - CONTRATO) ---

    // Fundo da metade inferior
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - (margin * 2),
      height: halfHeight - margin,
      color: lightYellow,
      borderColor: black,
      borderWidth: 2,
    });

    // --- TÍTULO DO CONTRATO ---
    page.drawText('CONTRATO', {
      x: (width - font.widthOfTextAtSize('CONTRATO', 20)) / 2,
      y: halfHeight - 30,
      size: 20,
      font: fontBold,
      color: black,
    });

    // --- CONTEÚDO DO CONTRATO ---
    let contratoY = halfHeight - 60;
    const contratoMargin = 30;

    // Introdução do contrato
    page.drawText('Eu', {
      x: contratoMargin,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    let introX = contratoMargin + font.widthOfTextAtSize('Eu', 11) + 5;
    drawDottedLine(introX, contratoY - 2, 200);
    if (aluno.nome_completo) {
      page.drawText(aluno.nome_completo, {
        x: introX + 3,
        y: contratoY,
        size: 11,
        font,
        color: black,
      });
    }

    contratoY -= 20;

    page.drawText('Identifico no verso faço o contrato para o aluno de', {
      x: contratoMargin,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    let alunoX = contratoMargin + font.widthOfTextAtSize('Identifico no verso faço o contrato para o aluno de', 11) + 5;
    drawDottedLine(alunoX, contratoY - 2, 150);
    if (aluno.nome_completo) {
      page.drawText(aluno.nome_completo, {
        x: alunoX + 3,
        y: contratoY,
        size: 11,
        font,
        color: black,
      });
    }

    contratoY -= 15;

    page.drawText('e declaro que comprometo-me ao cumprimento de todas as formalidade que orientam este', {
      x: contratoMargin,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    contratoY -= 15;

    page.drawText('centro de ensino, nomeadamente:', {
      x: contratoMargin,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    contratoY -= 25;

    // Lista de condições do contrato
    const condicoes = [
      'Efectuar o pagamento logo no acto da inscrição.',
      'Frequentar as aulas do código o mínimo 3 vezes por semana logo após a inscrição.',
      'Não requerer exame sem previo autorização do instrutor.',
      'Não faltar as aulas praticas de condução sem aviso excepto casos justificados.',
      'Que faltando 30 dias sem justificação nas aulas praticas de condução, o contrato é',
      'automaticamente anulado e sem direito a reembolso',
      'O contrato é válido por _______ meses; contados a partir da data de inscrição.',
      'Não aceita-se trocas nem devoluções',
      'Só depois de o saber sinais e regras gerais de trânsito é que o aluno iniciará a instrução',
      'prática de condução.'
    ];

    let itemNum = 1;
    condicoes.forEach((condicao, index) => {
      // Numeração apenas para itens principais (não continuações)
      if (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 6 || index === 7 || index === 8) {
        page.drawText(`${itemNum}º —`, {
          x: contratoMargin,
          y: contratoY,
          size: 10,
          font: fontBold,
          color: black,
        });
        itemNum++;
      }

      const textX = (index === 5 || index === 9) ? contratoMargin + 25 : contratoMargin + 30; // Indentação para continuações

      page.drawText(condicao, {
        x: textX,
        y: contratoY,
        size: 10,
        font,
        color: black,
      });

      contratoY -= 12;
    });

    // --- SEÇÃO DE ASSINATURAS ---
    contratoY -= 20;

    // Assinatura do Aluno
    page.drawText('Assinatura do Aluno.', {
      x: contratoMargin + 50,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    // Data
    page.drawText('Data', {
      x: width - 150,
      y: contratoY,
      size: 11,
      font,
      color: black,
    });

    contratoY -= 30;

    // Linhas para assinatura
    drawDottedLine(contratoMargin + 30, contratoY, 150);
    drawDottedLine(width - 170, contratoY, 120);

    // --- Salvar e baixar PDF ---
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Ficha_${aluno.nome_completo?.replace(/\s+/g, '_') || 'aluno'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando detalhes do aluno...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Aluno não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V6m0 0l-7 7m7-7l7 7" />
            </svg>
            Imprimir PDF
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalhes do Aluno</h1>
        <p className="text-gray-600">Ficha: {aluno.numero_ficha}</p>
      </div>

      {/* Informações do Aluno */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {aluno.foto_url && (
            <div className="flex-shrink-0">
              <img
                src={aluno.foto_url}
                alt={aluno.nome_completo}
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
              />
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Informações Pessoais</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Nome:</span> {aluno.nome_completo}</p>
                <p><span className="font-semibold">Apelido:</span> {aluno.apelido}</p>
                <p><span className="font-semibold">Data de Nascimento:</span> {formatDate(aluno.data_nascimento)}</p>
                <p><span className="font-semibold">Gênero:</span> {aluno.genero}</p>
                <p><span className="font-semibold">Estado Civil:</span> {aluno.estado_civil}</p>
                <p><span className="font-semibold">Profissão:</span> {aluno.profissao}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Contato e Identificação</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Email:</span> {aluno.email}</p>
                <p><span className="font-semibold">Telefone:</span> {aluno.telefone_principal}</p>
                {aluno.telefone_alternativo && (
                  <p><span className="font-semibold">Tel. Alternativo:</span> {aluno.telefone_alternativo}</p>
                )}
                <p><span className="font-semibold">Endereço:</span> {aluno.endereco}, {aluno.numero_casa}</p>
                <p><span className="font-semibold">Identificação:</span> {aluno.tipo_identificacao} - {aluno.numero_identificacao}</p>
                <p><span className="font-semibold">País de Origem:</span> {aluno.pais_origem}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Informações Familiares</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <p><span className="font-semibold">Local de Nascimento:</span> {aluno.local_nascimento}</p>
            <p><span className="font-semibold">Nome do Pai:</span> {aluno.nome_pai}</p>
            <p><span className="font-semibold">Nome da Mãe:</span> {aluno.nome_mae}</p>
          </div>
        </div>
      </div>

      {/* Matrículas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Matrículas</h2>
          {/* Só mostrar botão se aluno não tiver matrícula */}
          {!alunoTemMatricula && (
            <button
              onClick={() => setShowMatriculaForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Nova Matrícula
            </button>
          )}
        </div>

        {/* Formulário de Nova Matrícula */}
        {showMatriculaForm && (
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Nova Matrícula</h3>
            <form onSubmit={handleSubmitMatricula} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escola *
                  </label>
                  <select
                    value={novaMatricula.id_escola}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, id_escola: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={0}>Selecione uma escola</option>
                    {escolas.map(escola => (
                      <option key={escola.id_escola} value={escola.id_escola}>
                        {escola.nome_escola}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria da Carta *
                  </label>
                  <select
                    value={novaMatricula.id_categoria_carta}
                    onChange={(e) => handleCategoriaChange(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={0}>Selecione uma categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nome_categoria} - {formatCurrency(categoria.preco_base)} (+ Taxa: {formatCurrency(TAXA_SERVICO)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início do Curso *
                  </label>
                  <input
                    type="date"
                    value={novaMatricula.data_inicio_curso}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, data_inicio_curso: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    value={novaMatricula.horario_inicio_curso}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, horario_inicio_curso: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (meses) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={novaMatricula.duracao_contrato_meses}
                    onChange={(e) => setNovaMatricula(prev => ({ ...prev, duracao_contrato_meses: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas *
                  </label>
                  <select
                    value={novaMatricula.numero_parcelas}
                    onChange={(e) => handleNumeroParcelasChange(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={1}>Total (1x)</option>
                    <option value={2}>2 Parcelas</option>
                    <option value={3}>3 Parcelas</option>
                  </select>
                </div>

                {/* Só mostrar valor da primeira parcela se não for pagamento total */}
                {novaMatricula.numero_parcelas > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Primeira Parcela *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={parseFloat(novaMatricula.custo_total_curso) || 0}
                      value={novaMatricula.valor_primeira_parcela || ''}
                      onChange={(e) => setNovaMatricula(prev => ({
                        ...prev,
                        valor_primeira_parcela: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Máximo: ${formatCurrency(novaMatricula.custo_total_curso)}`}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor máximo: {formatCurrency(novaMatricula.custo_total_curso)}
                    </p>
                  </div>
                )}
              </div>

              {/* Seção de Total a Pagar - FIXED */}
              {novaMatricula.id_categoria_carta > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Resumo Financeiro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {(() => {
                      const categoria = categorias.find(c => c.id_categoria === novaMatricula.id_categoria_carta);
                      const custoBase = categoria ? parseFloat(categoria.preco_base) : 0;
                      const totalComTaxa = custoBase + TAXA_SERVICO;

                      return (
                        <>
                          <div>
                            <p className="text-gray-600">Custo do Curso:</p>
                            <p className="font-semibold">{formatCurrency(custoBase)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Taxa de Serviço:</p>
                            <p className="font-semibold">{formatCurrency(TAXA_SERVICO)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total a Pagar:</p>
                            <p className="font-semibold text-lg text-blue-700">
                              {formatCurrency(totalComTaxa)}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={novaMatricula.observacoes}
                  onChange={(e) => setNovaMatricula(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Informações adicionais sobre a matrícula..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submittingMatricula}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submittingMatricula ? 'Criando...' : 'Criar Matrícula'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMatriculaForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {!Array.isArray(matriculas) || matriculas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-4">Nenhuma matrícula encontrada para este aluno.</p>
            <p className="text-gray-400">Clique em "Nova Matrícula" para começar.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {matriculas.map((matricula) => (
              <div key={matricula.id_matricula} className="border border-gray-200 rounded-lg p-6">
                {/* Informações da Matrícula */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Matrícula #{matricula.id_matricula}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(matricula.status_matricula)}`}>
                      {matricula.status_matricula}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <p><span className="font-semibold">Data Matrícula:</span> {formatDate(matricula.data_matricula)}</p>
                    <p><span className="font-semibold">Início do Curso:</span> {formatDate(matricula.data_inicio_curso)}</p>
                    <p><span className="font-semibold">Horário:</span> {matricula.horario_inicio_curso}</p>
                    <p><span className="font-semibold">Duração:</span> {matricula.duracao_contrato_meses} meses</p>
                  </div>

                  <div className="mt-4">
                    <p><span className="font-semibold">Custo Total:</span> {formatCurrency(matricula.custo_total_curso)}</p>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                {matricula.resumo_financeiro && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-800">Resumo Financeiro</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Valor Total</p>
                        <p className="font-semibold">{formatCurrency(matricula.resumo_financeiro.valor_total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor Pago</p>
                        <p className="font-semibold text-green-600">{formatCurrency(matricula.resumo_financeiro.valor_pago)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor Pendente</p>
                        <p className="font-semibold text-red-600">{formatCurrency(matricula.resumo_financeiro.valor_pendente)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">% Pago</p>
                        <p className="font-semibold">{matricula.resumo_financeiro.percentual_pago}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status das Parcelas */}
                {matricula.status_parcelas && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3 text-gray-800">Status das Parcelas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">{matricula.status_parcelas.total_parcelas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pagas</p>
                        <p className="font-semibold text-green-600">{matricula.status_parcelas.parcelas_pagas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pendentes</p>
                        <p className="font-semibold text-yellow-600">{matricula.status_parcelas.parcelas_pendentes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parciais</p>
                        <p className="font-semibold text-blue-600">{matricula.status_parcelas.parcelas_parciais}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vencidas</p>
                        <p className="font-semibold text-red-600">{matricula.status_parcelas.parcelas_vencidas}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Parcelas */}
                {matricula.parcelas && matricula.parcelas.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-800">Parcelas</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Parcela</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Vencimento</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Valor</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matricula.parcelas.map((parcela: Parcela) => (
                            <tr key={parcela.id_parcela} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">#{parcela.numero_parcela}</td>
                              <td className="border border-gray-300 px-4 py-2">{formatDate(parcela.data_vencimento)}</td>
                              <td className="border border-gray-300 px-4 py-2">{formatCurrency(parcela.valor_devido)}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parcela.status_parcela)}`}>
                                  {parcela.status_parcela}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {!isParcelaPaga(parcela.status_parcela) && (
                                  <button
                                    onClick={() => handlePagarParcela(parcela, matricula.id_matricula)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                  >
                                    Pagar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {parcelaParaPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Pagar Parcela #{parcelaParaPagar.numero_parcela}</h3>
            <form onSubmit={handleSubmitPagamento}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Valor a pagar</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded bg-gray-100"
                  value={formatCurrency(parcelaParaPagar.valor_devido)}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Método de pagamento</label>
                <select
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={metodoPagamento}
                  onChange={e => setMetodoPagamento(e.target.value)}
                  required
                >
                  <option value="">Selecione o método</option>
                  <option value="mpesa">Mpesa</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="banco">Transferência Bancária</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-medium">Observações</label>
                <textarea
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
                  value={observacoesPagamento}
                  onChange={e => setObservacoesPagamento(e.target.value)}
                  rows={3}
                  placeholder="Informações adicionais sobre o pagamento..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  onClick={() => {
                    setParcelaParaPagar(null);
                    setMetodoPagamento('');
                    setObservacoesPagamento('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                  disabled={!metodoPagamento}
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Sucesso do Pagamento */}
      {detalhesPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Pagamento Registrado!</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">Matrícula:</span> #{detalhesPagamento.matricula_id}</div>
                <div><span className="font-semibold">Parcela:</span> #{detalhesPagamento.parcela_numero}</div>
                <div><span className="font-semibold">Valor:</span> {formatCurrency(detalhesPagamento.valor_pago)}</div>
                <div><span className="font-semibold">Método:</span> {detalhesPagamento.metodo_pagamento}</div>
                <div><span className="font-semibold">Status:</span>
                  <span className="text-green-600 font-medium"> {detalhesPagamento.status_atual}</span>
                </div>
                <div><span className="font-semibold">Data:</span> {detalhesPagamento.data_pagamento}</div>
              </div>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              onClick={() => setDetalhesPagamento(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementsDetails;