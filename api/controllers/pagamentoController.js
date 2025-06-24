const Pagamento = require("../models/Pagamento");
const Parcela = require("../models/Parcela");
const Matricula = require("../models/Matricula");

// Pagar parcela - valor vem automaticamente da parcela
// Função pagarParcela atualizada com suporte M-Pesa
exports.pagarParcela = async (req, res) => {
    const { id_matricula, id_parcela, metodo_pagamento, observacoes } = req.body;
    const registado_por = req.user.id;

    try {
        // Validar campos obrigatórios
        if (!id_matricula || !id_parcela || !metodo_pagamento) {
            return res.status(400).json({ 
                message: "Campos obrigatórios: id_matricula, id_parcela, metodo_pagamento" 
            });
        }

        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(id_matricula);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Buscar a parcela para obter o valor_devido
        const parcela = await Parcela.getById(id_parcela);
        if (!parcela) {
            return res.status(404).json({ message: "Parcela não encontrada" });
        }

        // Verificar se a parcela pertence à matrícula
        if (parcela.id_matricula !== parseInt(id_matricula)) {
            return res.status(400).json({ message: "Parcela não pertence a esta matrícula" });
        }

        // Verificar se a parcela já foi paga
        if (parcela.status_parcela === 'Paga') {
            return res.status(400).json({ 
                message: `Parcela ${parcela.numero_parcela} já foi paga anteriormente` 
            });
        }

        const valor_pago = parseFloat(parcela.valor_devido);

        // Registrar o pagamento
        const pagamentoData = {
            id_matricula: parseInt(id_matricula),
            id_parcela: parseInt(id_parcela),
            valor_pago: valor_pago,
            metodo_pagamento,
            observacoes: observacoes || `Pagamento integral da parcela ${parcela.numero_parcela}`,
            registado_por
        };

        const pagamentoId = await Pagamento.create(pagamentoData);

        // Atualizar status da parcela para "Paga"
        await Parcela.update(id_parcela, { 
            id_matricula: parcela.id_matricula,
            numero_parcela: parcela.numero_parcela,
            valor_devido: parcela.valor_devido,
            data_vencimento: parcela.data_vencimento,
            status_parcela: 'Paga'
        });

        // Resposta de sucesso
        const responseData = { 
            message: "Pagamento registrado com sucesso",
            pagamentoId,
            detalhes: {
                matricula_id: parseInt(id_matricula),
                parcela_numero: parcela.numero_parcela,
                valor_pago: valor_pago,
                metodo_pagamento,
                status_anterior: parcela.status_parcela,
                status_atual: 'Paga',
                data_pagamento: new Date().toLocaleString('pt-MZ'),
                registado_por: req.user.nome || req.user.id
            }
        };

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        res.status(500).json({ 
            message: "Erro ao registrar pagamento", 
            error: error.message 
        });
    }
};

// Função createPagamento atualizada
exports.createPagamento = async (req, res) => {
    const { id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes } = req.body;
    const registado_por = req.user.id;

    try {
        // Validações básicas
        if (!id_matricula || !valor_pago || !metodo_pagamento) {
            return res.status(400).json({ 
                message: "Campos obrigatórios: id_matricula, valor_pago, metodo_pagamento" 
            });
        }

        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(id_matricula);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Buscar a parcela para obter o valor_devido
        const parcela = await Parcela.getById(id_parcela);
        if (!parcela) {
            return res.status(404).json({ message: "Parcela não encontrada" });
        }

        // Verificar se a parcela pertence à matrícula
        if (parcela.id_matricula !== parseInt(id_matricula)) {
            return res.status(400).json({ message: "Parcela não pertence a esta matrícula" });
        }

        // Verificar se a parcela já foi paga
        if (parcela.status_parcela === 'Paga') {
            return res.status(400).json({ 
                message: `Parcela ${parcela.numero_parcela} já foi paga anteriormente` 
            });
        }

        const valor_pago_float = parseFloat(valor_pago);

        // Registrar o pagamento
        const pagamentoData = {
            id_matricula: parseInt(id_matricula),
            id_parcela: parseInt(id_parcela),
            valor_pago: valor_pago_float,
            metodo_pagamento,
            observacoes: observacoes || `Pagamento integral da parcela ${parcela.numero_parcela}`,
            registado_por
        };

        const pagamentoId = await Pagamento.create(pagamentoData);

        // Atualizar status da parcela para "Paga"
        await Parcela.update(id_parcela, { 
            id_matricula: parcela.id_matricula,
            numero_parcela: parcela.numero_parcela,
            valor_devido: parcela.valor_devido,
            data_vencimento: parcela.data_vencimento,
            status_parcela: 'Paga'
        });

        // Resposta de sucesso
        const responseData = { 
            message: "Pagamento registrado com sucesso", 
            pagamentoId 
        };

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        res.status(500).json({ 
            message: "Erro ao registrar pagamento", 
            error: error.message 
        });
    }
};

// Buscar todas as parcelas disponíveis para pagamento
exports.getParcelasParaPagamento = async (req, res) => {
    try {
        const matriculaId = req.params.matriculaId;
        
        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(matriculaId);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Buscar parcelas pendentes (não pagas)
        const todasParcelas = await Parcela.getByMatriculaId(matriculaId);
        const parcelasDisponiveis = todasParcelas.filter(parcela => 
            parcela.status_parcela === 'Pendente' || parcela.status_parcela === 'Parcialmente Paga'
        );

        // Verificar parcelas vencidas
        const hoje = new Date().toISOString().slice(0, 10);
        const parcelasFormatadas = parcelasDisponiveis.map(parcela => {
            const dataVencimento = new Date(parcela.data_vencimento);
            const dataHoje = new Date(hoje);
            const diferencaDias = Math.floor((dataHoje - dataVencimento) / (1000 * 60 * 60 * 24));

            return {
                id_parcela: parcela.id_parcela,
                numero_parcela: parcela.numero_parcela,
                valor_devido: parseFloat(parcela.valor_devido), // Valor que será pago automaticamente
                data_vencimento: parcela.data_vencimento,
                status_parcela: parcela.status_parcela,
                vencida: parcela.data_vencimento < hoje,
                dias_vencimento: diferencaDias > 0 ? diferencaDias : 0,
                urgencia: diferencaDias > 30 ? 'alta' : diferencaDias > 0 ? 'media' : 'baixa'
            };
        });

        // Ordenar por data de vencimento
        parcelasFormatadas.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));

        res.status(200).json({
            matricula_id: parseInt(matriculaId),
            total_parcelas_disponiveis: parcelasFormatadas.length,
            total_valor_devido: parcelasFormatadas.reduce((total, p) => total + p.valor_devido, 0),
            parcelas_vencidas: parcelasFormatadas.filter(p => p.vencida).length,
            parcelas_para_pagamento: parcelasFormatadas
        });

    } catch (error) {
        console.error('Erro ao buscar parcelas para pagamento:', error);
        res.status(500).json({ message: "Erro ao buscar parcelas para pagamento" });
    }
};

// Consultar histórico de pagamentos de uma matrícula
exports.getHistoricoPagamentos = async (req, res) => {
    try {
        const matriculaId = req.params.matriculaId;
        
        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(matriculaId);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Buscar pagamentos da matrícula
        const pagamentos = await Pagamento.getByMatriculaId(matriculaId);
        
        // Buscar todas as parcelas para correlacionar
        const parcelas = await Parcela.getByMatriculaId(matriculaId);
        
        // Formatar dados com informações das parcelas
        const historico = pagamentos.map(pagamento => {
            const parcelaRelacionada = pagamento.id_parcela ? 
                parcelas.find(p => p.id_parcela === pagamento.id_parcela) : null;

            return {
                id_pagamento: pagamento.id_pagamento,
                id_parcela: pagamento.id_parcela,
                numero_parcela: parcelaRelacionada ? parcelaRelacionada.numero_parcela : null,
                valor_pago: parseFloat(pagamento.valor_pago),
                metodo_pagamento: pagamento.metodo_pagamento,
                data_pagamento: pagamento.data_pagamento,
                observacoes: pagamento.observacoes,
                tipo_pagamento: pagamento.id_parcela ? 'Pagamento de Parcela' : 'Pagamento Manual'
            };
        });

        // Ordenar por data de pagamento (mais recente primeiro)
        historico.sort((a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento));

        res.status(200).json({
            matricula_id: parseInt(matriculaId),
            total_pagamentos: historico.length,
            valor_total_pago: historico.reduce((total, p) => total + p.valor_pago, 0),
            ultimo_pagamento: historico.length > 0 ? historico[0].data_pagamento : null,
            historico_pagamentos: historico
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ message: "Erro ao buscar histórico de pagamentos" });
    }
};

// Obter resumo financeiro de uma matrícula
exports.getResumoFinanceiro = async (req, res) => {
    try {
        const matriculaId = req.params.matriculaId;
        
        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(matriculaId);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        // Buscar parcelas e pagamentos
        const parcelas = await Parcela.getByMatriculaId(matriculaId);
        const pagamentos = await Pagamento.getByMatriculaId(matriculaId);

        // Calcular totais
        const valorTotal = parcelas.reduce((total, parcela) => total + parseFloat(parcela.valor_devido), 0);
        const valorPago = pagamentos.reduce((total, pagamento) => total + parseFloat(pagamento.valor_pago), 0);
        const valorPendente = valorTotal - valorPago;

        // Estatísticas das parcelas
        const parcelasPagas = parcelas.filter(p => p.status_parcela === 'Paga').length;
        const parcelasPendentes = parcelas.filter(p => p.status_parcela === 'Pendente').length;
        const parcelasParciais = parcelas.filter(p => p.status_parcela === 'Parcialmente Paga').length;

        // Parcelas vencidas
        const hoje = new Date().toISOString().slice(0, 10);
        const parcelasVencidas = parcelas.filter(p => 
            p.status_parcela !== 'Paga' && p.data_vencimento < hoje
        ).length;

        // Próxima parcela a vencer
        const parcelasNaoPagas = parcelas.filter(p => p.status_parcela !== 'Paga');
        parcelasNaoPagas.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
        const proximaParcela = parcelasNaoPagas.length > 0 ? parcelasNaoPagas[0] : null;

        res.status(200).json({
            matricula_id: parseInt(matriculaId),
            resumo_financeiro: {
                valor_total_curso: parseFloat(valorTotal.toFixed(2)),
                valor_total_pago: parseFloat(valorPago.toFixed(2)),
                valor_pendente: parseFloat(valorPendente.toFixed(2)),
                percentual_pago: valorTotal > 0 ? parseFloat(((valorPago / valorTotal) * 100).toFixed(2)) : 0,
                status_financeiro: valorPendente <= 0 ? 'Quitado' : parcelasVencidas > 0 ? 'Em Atraso' : 'Em Dia'
            },
            estatisticas_parcelas: {
                total_parcelas: parcelas.length,
                parcelas_pagas: parcelasPagas,
                parcelas_pendentes: parcelasPendentes,
                parcelas_parciais: parcelasParciais,
                parcelas_vencidas: parcelasVencidas
            },
            proxima_parcela: proximaParcela ? {
                id_parcela: proximaParcela.id_parcela,
                numero_parcela: proximaParcela.numero_parcela,
                valor_devido: parseFloat(proximaParcela.valor_devido),
                data_vencimento: proximaParcela.data_vencimento,
                dias_para_vencimento: Math.ceil((new Date(proximaParcela.data_vencimento) - new Date()) / (1000 * 60 * 60 * 24))
            } : null,
            total_pagamentos_realizados: pagamentos.length,
            ultimo_pagamento: pagamentos.length > 0 ? {
                data: pagamentos[pagamentos.length - 1].data_pagamento,
                valor: parseFloat(pagamentos[pagamentos.length - 1].valor_pago),
                metodo: pagamentos[pagamentos.length - 1].metodo_pagamento
            } : null
        });

    } catch (error) {
        console.error('Erro ao gerar resumo financeiro:', error);
        res.status(500).json({ message: "Erro ao gerar resumo financeiro" });
    }
};

// Listar todos os pagamentos (com filtros opcionais)
exports.getAllPagamentos = async (req, res) => {
    try {
        const { escola_id, data_inicio, data_fim, metodo_pagamento } = req.query;
        
        let pagamentos = await Pagamento.getAll();

        // Aplicar filtros se fornecidos
        if (escola_id) {
            // Filtrar por escola (precisa fazer join com matrículas)
            const matriculasEscola = await Matricula.getAll();
            const matriculasIds = matriculasEscola
                .filter(m => m.id_escola === parseInt(escola_id))
                .map(m => m.id_matricula);
            
            pagamentos = pagamentos.filter(p => matriculasIds.includes(p.id_matricula));
        }

        if (data_inicio) {
            pagamentos = pagamentos.filter(p => p.data_pagamento >= data_inicio);
        }

        if (data_fim) {
            pagamentos = pagamentos.filter(p => p.data_pagamento <= data_fim);
        }

        if (metodo_pagamento) {
            pagamentos = pagamentos.filter(p => p.metodo_pagamento === metodo_pagamento);
        }

        // Formatar dados
        const pagamentosFormatados = pagamentos.map(pagamento => ({
            id_pagamento: pagamento.id_pagamento,
            id_matricula: pagamento.id_matricula,
            id_parcela: pagamento.id_parcela,
            valor_pago: parseFloat(pagamento.valor_pago),
            metodo_pagamento: pagamento.metodo_pagamento,
            data_pagamento: pagamento.data_pagamento,
            observacoes: pagamento.observacoes
        }));

        const valorTotal = pagamentosFormatados.reduce((total, p) => total + p.valor_pago, 0);

        res.status(200).json({
            total_pagamentos: pagamentosFormatados.length,
            valor_total: parseFloat(valorTotal.toFixed(2)),
            filtros_aplicados: { escola_id, data_inicio, data_fim, metodo_pagamento },
            pagamentos: pagamentosFormatados
        });

    } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        res.status(500).json({ message: "Erro ao buscar pagamentos" });
    }
};

// Buscar pagamento por ID
exports.getPagamentoById = async (req, res) => {
    try {
        const pagamento = await Pagamento.getById(req.params.id);
        if (!pagamento) {
            return res.status(404).json({ message: "Pagamento não encontrado" });
        }

        // Buscar informações adicionais da parcela se existir
        let infoAdicional = {};
        if (pagamento.id_parcela) {
            const parcela = await Parcela.getById(pagamento.id_parcela);
            if (parcela) {
                infoAdicional = {
                    numero_parcela: parcela.numero_parcela,
                    data_vencimento_parcela: parcela.data_vencimento,
                    status_parcela: parcela.status_parcela
                };
            }
        }

        res.status(200).json({
            ...pagamento,
            valor_pago: parseFloat(pagamento.valor_pago),
            ...infoAdicional
        });

    } catch (error) {
        console.error('Erro ao buscar pagamento:', error);
        res.status(500).json({ message: "Erro ao buscar pagamento" });
    }
};

// Atualizar pagamento
exports.updatePagamento = async (req, res) => {
    try {
        const { metodo_pagamento, observacoes } = req.body;
        
        // Buscar pagamento existente
        const pagamentoExistente = await Pagamento.getById(req.params.id);
        if (!pagamentoExistente) {
            return res.status(404).json({ message: "Pagamento não encontrado" });
        }

        // Atualizar apenas campos permitidos (não valor nem IDs)
        const dadosAtualizacao = {
            ...pagamentoExistente,
            metodo_pagamento: metodo_pagamento || pagamentoExistente.metodo_pagamento,
            observacoes: observacoes || pagamentoExistente.observacoes
        };

        const affectedRows = await Pagamento.update(req.params.id, dadosAtualizacao);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Nenhuma alteração realizada" });
        }

        res.status(200).json({ 
            message: "Pagamento atualizado com sucesso",
            campos_alterados: { metodo_pagamento, observacoes }
        });

    } catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        res.status(500).json({ message: "Erro ao atualizar pagamento" });
    }
};

// Deletar pagamento
exports.deletePagamento = async (req, res) => {
    try {
        const pagamento = await Pagamento.getById(req.params.id);
        if (!pagamento) {
            return res.status(404).json({ message: "Pagamento não encontrado" });
        }

        // Se o pagamento está associado a uma parcela, reverter o status
        if (pagamento.id_parcela) {
            const parcela = await Parcela.getById(pagamento.id_parcela);
            if (parcela && parcela.status_parcela === 'Paga') {
                await Parcela.update(pagamento.id_parcela, {
                    ...parcela,
                    status_parcela: 'Pendente'
                });
            }
        }

        const affectedRows = await Pagamento.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Erro ao deletar pagamento" });
        }

        res.status(200).json({ 
            message: "Pagamento deletado com sucesso",
            detalhes: {
                id_pagamento: req.params.id,
                valor_estornado: parseFloat(pagamento.valor_pago),
                parcela_revertida: pagamento.id_parcela ? `Parcela ${pagamento.id_parcela} voltou para status Pendente` : null
            }
        });

    } catch (error) {
        console.error('Erro ao deletar pagamento:', error);
        res.status(500).json({ message: "Erro ao deletar pagamento" });
    }
};

// Buscar pagamentos por matrícula
exports.getPagamentosByMatriculaId = async (req, res) => {
    try {
        const matriculaId = req.params.matriculaId;
        
        // Verificar se a matrícula existe
        const matricula = await Matricula.getById(matriculaId);
        if (!matricula) {
            return res.status(404).json({ message: "Matrícula não encontrada" });
        }

        const pagamentos = await Pagamento.getByMatriculaId(matriculaId);
        
        // Formatar dados
        const pagamentosFormatados = pagamentos.map(pagamento => ({
            id_pagamento: pagamento.id_pagamento,
            id_parcela: pagamento.id_parcela,
            valor_pago: parseFloat(pagamento.valor_pago),
            metodo_pagamento: pagamento.metodo_pagamento,
            data_pagamento: pagamento.data_pagamento,
            observacoes: pagamento.observacoes
        }));

        res.status(200).json({
            matricula_id: parseInt(matriculaId),
            total_pagamentos: pagamentosFormatados.length,
            valor_total_pago: pagamentosFormatados.reduce((total, p) => total + p.valor_pago, 0),
            pagamentos: pagamentosFormatados
        });

    } catch (error) {
        console.error('Erro ao buscar pagamentos por matrícula:', error);
        res.status(500).json({ message: "Erro ao buscar pagamentos por matrícula" });
    }
};

// Relatório de pagamentos por período
exports.getRelatorioPagamentos = async (req, res) => {
    try {
        const { data_inicio, data_fim, escola_id } = req.query;
        
        if (!data_inicio || !data_fim) {
            return res.status(400).json({ 
                message: "Parâmetros obrigatórios: data_inicio e data_fim" 
            });
        }

        let pagamentos = await Pagamento.getAll();
        
        // Filtrar por período
        pagamentos = pagamentos.filter(p => {
            const dataPagamento = p.data_pagamento.toISOString().slice(0, 10);
            return dataPagamento >= data_inicio && dataPagamento <= data_fim;
        });

        // Filtrar por escola se especificado
        if (escola_id) {
            const matriculasEscola = await Matricula.getAll();
            const matriculasIds = matriculasEscola
                .filter(m => m.id_escola === parseInt(escola_id))
                .map(m => m.id_matricula);
            
            pagamentos = pagamentos.filter(p => matriculasIds.includes(p.id_matricula));
        }

        // Agrupar por método de pagamento
        const porMetodo = {};
        pagamentos.forEach(p => {
            if (!porMetodo[p.metodo_pagamento]) {
                porMetodo[p.metodo_pagamento] = { quantidade: 0, valor_total: 0 };
            }
            porMetodo[p.metodo_pagamento].quantidade++;
            porMetodo[p.metodo_pagamento].valor_total += parseFloat(p.valor_pago);
        });

        // Agrupar por dia
        const porDia = {};
        pagamentos.forEach(p => {
            const dia = p.data_pagamento.toISOString().slice(0, 10);
            if (!porDia[dia]) {
                porDia[dia] = { quantidade: 0, valor_total: 0 };
            }
            porDia[dia].quantidade++;
            porDia[dia].valor_total += parseFloat(p.valor_pago);
        });

        const valorTotal = pagamentos.reduce((total, p) => total + parseFloat(p.valor_pago), 0);

        res.status(200).json({
            periodo: { data_inicio, data_fim },
            escola_id: escola_id || 'Todas',
            resumo: {
                total_pagamentos: pagamentos.length,
                valor_total: parseFloat(valorTotal.toFixed(2)),
                ticket_medio: pagamentos.length > 0 ? parseFloat((valorTotal / pagamentos.length).toFixed(2)) : 0
            },
            por_metodo_pagamento: porMetodo,
            por_dia: porDia,
            pagamentos_detalhados: pagamentos.map(p => ({
                id_pagamento: p.id_pagamento,
                id_matricula: p.id_matricula,
                valor_pago: parseFloat(p.valor_pago),
                metodo_pagamento: p.metodo_pagamento,
                data_pagamento: p.data_pagamento,
                observacoes: p.observacoes
            }))
        });

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ message: "Erro ao gerar relatório de pagamentos" });
    }
};