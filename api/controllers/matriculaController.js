const Matricula = require("../models/Matricula");
const CategoriaCarta = require("../models/CategoriaCarta");
const Parcela = require("../models/Parcela");
const Pagamento = require("../models/Pagamento");

exports.createMatricula = async (req, res) => {
    try {
        const {
            id_aluno,
            id_escola,
            id_categoria_carta,
            numero_parcelas,
            valor_primeira_parcela,
            duracao_contrato_meses,
            data_inicio_curso,
            custo_total_curso
        } = req.body;

        // Validar campos obrigatórios
        if (!id_aluno || !id_escola || !id_categoria_carta || !valor_primeira_parcela) {
            return res.status(400).json({
                message: "Campos obrigatórios: id_aluno, id_escola, id_categoria_carta, valor_primeira_parcela"
            });
        }

        // Buscar o preço da categoria
        const categoria = await CategoriaCarta.getById(id_categoria_carta);
        if (!categoria) {
            return res.status(400).json({ message: "Categoria de carta não encontrada" });
        }

        // Limitar o número de parcelas a no máximo 3
        let nParcelas = Number(numero_parcelas) || 1;
        if (nParcelas > 3) nParcelas = 3;
        if (nParcelas < 1) nParcelas = 1;

        // Validar valor da primeira parcela
        const valorPrimeiraParcela = Number(valor_primeira_parcela);
        if (valorPrimeiraParcela <= 0) {
            return res.status(400).json({ message: "Valor da primeira parcela deve ser maior que zero" });
        }

        // Usar o custo_total_curso enviado pelo frontend (que inclui taxa de serviço)
        // Se não for fornecido, usar o preço da categoria + taxa de serviço padrão
        const custoTotal = Number(custo_total_curso) || (Number(categoria.preco) + 600);
        
        if (valorPrimeiraParcela > custoTotal) {
            return res.status(400).json({
                message: `Valor da primeira parcela (${valorPrimeiraParcela}) não pode ser maior que o custo total do curso (${custoTotal})`
            });
        }

        // Calcular valor das parcelas restantes
        const valorRestante = custoTotal - valorPrimeiraParcela;
        const parcelasRestantes = nParcelas - 1;
        const valorDemaisParcelas = parcelasRestantes > 0 ? valorRestante / parcelasRestantes : 0;

        // Limitar a duração do contrato a no máximo 6 meses
        let duracaoMeses = Number(duracao_contrato_meses) || 3;
        if (duracaoMeses > 6) duracaoMeses = 6;
        if (duracaoMeses < 1) duracaoMeses = 1;

        // Definir data de início do curso (hoje se não fornecida)
        const dataInicioCurso = data_inicio_curso || new Date().toISOString().slice(0, 10);

        // Preencher campos padrão
        const matriculaData = {
            id_aluno: Number(id_aluno),
            id_escola: Number(id_escola),
            id_categoria_carta: Number(id_categoria_carta),
            data_inicio_curso: dataInicioCurso,
            custo_total_curso: custoTotal,
            status_matricula: req.body.status_matricula || 'Ativa',
            horario_inicio_curso: req.body.horario_inicio_curso || '08:00:00',
            duracao_contrato_meses: duracaoMeses,
            data_fim_instrucao: req.body.data_fim_instrucao || null
        };

        const matriculaId = await Matricula.create(matriculaData);

        // CALCULAR as datas de vencimento automaticamente
        const datasVencimento = [];
        for (let i = 0; i < nParcelas; i++) {
            const dataVencimento = new Date();
            // CORREÇÃO: Para parcela única, vencimento imediato ou conforme regra de negócio
            if (nParcelas === 1) {
                // Se é parcela única, pode vencer hoje ou em alguns dias
                dataVencimento.setDate(dataVencimento.getDate() + 7); // 7 dias a partir de hoje, ajuste conforme necessário
            } else {
                // Para múltiplas parcelas, vence no próximo mês + i
                dataVencimento.setMonth(dataVencimento.getMonth() + i + 1);
            }
            datasVencimento.push(dataVencimento.toISOString().slice(0, 10));
        }

        // Criar as parcelas
        const parcelasCreated = [];
        for (let i = 0; i < nParcelas; i++) {
            let valorParcela;

            if (i === 0) {
                valorParcela = valorPrimeiraParcela;
            } else {
                valorParcela = parseFloat(valorDemaisParcelas.toFixed(2));
            }

            const parcelaId = await Parcela.create({
                id_matricula: matriculaId,
                numero_parcela: i + 1,
                valor_devido: valorParcela,
                data_vencimento: datasVencimento[i],
                status_parcela: 'Pendente'
            });

            parcelasCreated.push({
                id: parcelaId,
                numero: i + 1,
                valor: valorParcela,
                vencimento: datasVencimento[i]
            });
        }

        res.status(201).json({
            message: "Matrícula criada com sucesso",
            matriculaId,
            numero_parcelas: nParcelas,
            custo_total: custoTotal,
            valor_primeira_parcela: valorPrimeiraParcela,
            valor_demais_parcelas: parcelasRestantes > 0 ? parseFloat(valorDemaisParcelas.toFixed(2)) : 0,
            valor_restante: valorRestante,
            parcelas: parcelasCreated
        });
    } catch (error) {
        console.error('Erro ao criar matrícula:', error);
        res.status(500).json({
            message: "Erro ao criar matrícula",
            error: error.message
        });
    }
};

// Função auxiliar para calcular informações financeiras
const calcularInformacoesFinanceiras = async (matriculaId) => {
    // Buscar parcelas da matrícula
    const parcelas = await Parcela.getByMatriculaId(matriculaId);

    // Buscar pagamentos da matrícula
    const pagamentos = await Pagamento.getByMatriculaId(matriculaId);

    // Calcular totais
    const valorTotal = parcelas.reduce((total, parcela) => total + Number(parcela.valor_devido), 0);
    const valorPago = pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor_pago), 0);
    const valorPendente = valorTotal - valorPago;

    // Contar status das parcelas
    const parcelasPagas = parcelas.filter(p => p.status_parcela === 'Paga').length;
    const parcelasPendentes = parcelas.filter(p => p.status_parcela === 'Pendente').length;
    const parcelasParciais = parcelas.filter(p => p.status_parcela === 'Parcialmente Paga').length;

    // Verificar parcelas vencidas
    const hoje = new Date().toISOString().slice(0, 10);
    const parcelasVencidas = parcelas.filter(p =>
        p.status_parcela !== 'Paga' && p.data_vencimento < hoje
    );

    return {
        resumo_financeiro: {
            valor_total: parseFloat(valorTotal.toFixed(2)),
            valor_pago: parseFloat(valorPago.toFixed(2)),
            valor_pendente: parseFloat(valorPendente.toFixed(2)),
            percentual_pago: valorTotal > 0 ? parseFloat(((valorPago / valorTotal) * 100).toFixed(2)) : 0
        },
        status_parcelas: {
            total_parcelas: parcelas.length,
            parcelas_pagas: parcelasPagas,
            parcelas_pendentes: parcelasPendentes,
            parcelas_parciais: parcelasParciais,
            parcelas_vencidas: parcelasVencidas.length
        },
        parcelas: parcelas.map(parcela => ({
            id_parcela: parcela.id_parcela,
            numero_parcela: parcela.numero_parcela,
            valor_devido: parseFloat(Number(parcela.valor_devido).toFixed(2)),
            data_vencimento: parcela.data_vencimento,
            status_parcela: parcela.status_parcela,
            vencida: parcela.status_parcela !== 'Paga' && parcela.data_vencimento < hoje
        })),
        pagamentos: pagamentos.map(pagamento => ({
            id_pagamento: pagamento.id_pagamento,
            valor_pago: parseFloat(Number(pagamento.valor_pago).toFixed(2)),
            data_pagamento: pagamento.data_pagamento,
            metodo_pagamento: pagamento.metodo_pagamento,
            observacoes: pagamento.observacoes
        }))
    };
};

exports.getAllMatriculas = async (req, res) => {
    try {
        const matriculas = await Matricula.getAll();

        // Adicionar informações financeiras para cada matrícula
        const matriculasComFinanceiro = await Promise.all(
            matriculas.map(async (matricula) => {
                const infoFinanceira = await calcularInformacoesFinanceiras(matricula.id_matricula);
                return {
                    ...matricula,
                    ...infoFinanceira
                };
            })
        );

        res.status(200).json(matriculasComFinanceiro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar matrículas" });
    }
};

exports.getMatriculaById = async (req, res) => {
    try {
        const matricula = await Matricula.getById(req.params.id);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Adicionar informações financeiras
        const infoFinanceira = await calcularInformacoesFinanceiras(matricula.id_matricula);

        const matriculaCompleta = {
            ...matricula,
            ...infoFinanceira
        };

        res.status(200).json(matriculaCompleta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar matrícula" });
    }
};

exports.updateMatricula = async (req, res) => {
    try {
        const affectedRows = await Matricula.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }
        res.status(200).json({ message: "Matrícula atualizada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar matrícula" });
    }
};


exports.getMatriculasByAlunoId = async (req, res) => {
    try {
        const { id_aluno } = req.params;

        const matriculas = await Matricula.getByAlunoId(id_aluno);

        if (matriculas.length === 0) {
            return res.status(404).json({ message: "Nenhuma matrícula encontrada para este aluno" });
        }

        // Adicionar informações financeiras para cada matrícula
        const matriculasComFinanceiro = await Promise.all(
            matriculas.map(async (matricula) => {
                const infoFinanceira = await calcularInformacoesFinanceiras(matricula.id_matricula);
                return {
                    ...matricula,
                    ...infoFinanceira
                };
            })
        );

        res.status(200).json(matriculasComFinanceiro);
    } catch (error) {
        console.error('Erro ao buscar matrículas por aluno:', error);
        res.status(500).json({
            message: "Erro ao buscar matrículas do aluno",
            error: error.message
        });
    }
};

exports.deleteMatricula = async (req, res) => {
    try {
        const affectedRows = await Matricula.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }
        res.status(200).json({ message: "Matrícula deletada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar matrícula" });
    }
};