const pool = require("../config/db");
const { dashboardResponse, errorResponse } = require("../utils/responseUtils");

/**
 * Obter estatísticas gerais do sistema
 */
exports.getGeneralStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userSchools = req.user.escolas;

        let schoolFilter = '';
        let params = [];

        // Filtrar por escolas do usuário (exceto Super Admin)
        if (userRole !== 1 && userSchools.length > 0) {
            schoolFilter = 'WHERE id_escola IN (' + userSchools.map(() => '?').join(',') + ')';
            params = userSchools;
        }

        // Estatísticas de alunos
        const [alunosResult] = await pool.execute(`
            SELECT 
                COUNT(*) as total_alunos,
                COUNT(CASE WHEN DATE(data_criacao) = CURDATE() THEN 1 END) as novos_hoje,
                COUNT(CASE WHEN DATE(data_criacao) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as novos_semana
            FROM alunos
            ${schoolFilter}
        `, params);

        // Estatísticas de matrículas
        const [matriculasResult] = await pool.execute(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(CASE WHEN status_matricula = 'Ativa' THEN 1 END) as matriculas_ativas,
                COUNT(CASE WHEN status_matricula = 'Concluída' THEN 1 END) as matriculas_concluidas,
                COUNT(CASE WHEN DATE(data_matricula) = CURDATE() THEN 1 END) as matriculas_hoje
            FROM matriculas
            ${schoolFilter}
        `, params);

        // Estatísticas financeiras
        const [financeiroResult] = await pool.execute(`
            SELECT 
                COALESCE(SUM(custo_total_curso), 0) as receita_total,
                COALESCE(SUM(valor_pago), 0) as receita_recebida,
                COALESCE(SUM(custo_total_curso) - SUM(valor_pago), 0) as receita_pendente
            FROM matriculas m
            LEFT JOIN pagamentos p ON m.id_matricula = p.id_matricula
            ${schoolFilter}
        `, params);

        // Estatísticas de exames
        const [examesResult] = await pool.execute(`
            SELECT 
                COUNT(*) as total_exames,
                COUNT(CASE WHEN resultado = 'Aprovado' THEN 1 END) as exames_aprovados,
                COUNT(CASE WHEN resultado = 'Reprovado' THEN 1 END) as exames_reprovados,
                COUNT(CASE WHEN DATE(data_exame) = CURDATE() THEN 1 END) as exames_hoje
            FROM exames e
            JOIN matriculas m ON e.id_matricula = m.id_matricula
            ${schoolFilter}
        `, params);

        // Estatísticas de escolas (apenas para Super Admin)
        let escolasStats = null;
        if (userRole === 1) {
            const [escolasResult] = await pool.execute(`
                SELECT COUNT(*) as total_escolas
                FROM escolas
            `);
            escolasStats = escolasResult[0];
        }

        const stats = {
            alunos: alunosResult[0],
            matriculas: matriculasResult[0],
            financeiro: financeiroResult[0],
            exames: examesResult[0],
            escolas: escolasStats
        };

        return dashboardResponse(res, stats, 'Estatísticas gerais recuperadas com sucesso');

    } catch (error) {
        console.error('Erro ao obter estatísticas gerais:', error);
        return errorResponse(res, 'Erro ao obter estatísticas gerais', 500, error);
    }
};

/**
 * Obter estatísticas por escola
 */
exports.getSchoolStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userSchools = req.user.escolas;

        let schoolFilter = '';
        let params = [];

        if (userRole !== 1 && userSchools.length > 0) {
            schoolFilter = 'WHERE e.id_escola IN (' + userSchools.map(() => '?').join(',') + ')';
            params = userSchools;
        }

        const [schoolsResult] = await pool.execute(`
            SELECT 
                e.id_escola,
                e.nome_escola,
                COUNT(DISTINCT a.id_aluno) as total_alunos,
                COUNT(DISTINCT m.id_matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN m.status_matricula = 'Ativa' THEN m.id_matricula END) as matriculas_ativas,
                COALESCE(SUM(m.custo_total_curso), 0) as receita_total,
                COALESCE(SUM(p.valor_pago), 0) as receita_recebida
            FROM escolas e
            LEFT JOIN alunos a ON e.id_escola = a.id_escola
            LEFT JOIN matriculas m ON e.id_escola = m.id_escola
            LEFT JOIN pagamentos p ON m.id_matricula = p.id_matricula
            ${schoolFilter}
            GROUP BY e.id_escola, e.nome_escola
            ORDER BY e.nome_escola
        `, params);

        return dashboardResponse(res, schoolsResult, 'Estatísticas por escola recuperadas com sucesso');

    } catch (error) {
        console.error('Erro ao obter estatísticas por escola:', error);
        return errorResponse(res, 'Erro ao obter estatísticas por escola', 500, error);
    }
};

/**
 * Obter estatísticas de pagamentos
 */
exports.getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userSchools = req.user.escolas;

        let schoolFilter = '';
        let params = [];

        if (userRole !== 1 && userSchools.length > 0) {
            schoolFilter = 'WHERE m.id_escola IN (' + userSchools.map(() => '?').join(',') + ')';
            params = userSchools;
        }

        // Pagamentos por mês (últimos 12 meses)
        const [monthlyPayments] = await pool.execute(`
            SELECT 
                DATE_FORMAT(p.data_pagamento, '%Y-%m') as mes,
                SUM(p.valor_pago) as total_pago,
                COUNT(p.id_pagamento) as num_pagamentos
            FROM pagamentos p
            JOIN matriculas m ON p.id_matricula = m.id_matricula
            ${schoolFilter}
            WHERE p.data_pagamento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(p.data_pagamento, '%Y-%m')
            ORDER BY mes DESC
        `, params);

        // Pagamentos por método
        const [paymentMethods] = await pool.execute(`
            SELECT 
                COALESCE(p.metodo_pagamento, 'Não especificado') as metodo,
                SUM(p.valor_pago) as total,
                COUNT(p.id_pagamento) as quantidade
            FROM pagamentos p
            JOIN matriculas m ON p.id_matricula = m.id_matricula
            ${schoolFilter}
            GROUP BY p.metodo_pagamento
            ORDER BY total DESC
        `, params);

        // Parcelas vencidas
        const [overdueParcels] = await pool.execute(`
            SELECT 
                COUNT(*) as total_vencidas,
                SUM(valor_devido) as valor_vencido
            FROM parcelas p
            JOIN matriculas m ON p.id_matricula = m.id_matricula
            ${schoolFilter}
            WHERE p.data_vencimento < CURDATE() 
            AND p.status_parcela = 'Pendente'
        `, params);

        const stats = {
            monthlyPayments,
            paymentMethods,
            overdueParcels: overdueParcels[0]
        };

        return dashboardResponse(res, stats, 'Estatísticas de pagamentos recuperadas com sucesso');

    } catch (error) {
        console.error('Erro ao obter estatísticas de pagamentos:', error);
        return errorResponse(res, 'Erro ao obter estatísticas de pagamentos', 500, error);
    }
};

/**
 * Obter estatísticas de exames
 */
exports.getExamStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userSchools = req.user.escolas;

        let schoolFilter = '';
        let params = [];

        if (userRole !== 1 && userSchools.length > 0) {
            schoolFilter = 'WHERE m.id_escola IN (' + userSchools.map(() => '?').join(',') + ')';
            params = userSchools;
        }

        // Exames por tipo
        const [examTypes] = await pool.execute(`
            SELECT 
                e.tipo_exame,
                COUNT(*) as total,
                COUNT(CASE WHEN e.resultado = 'Aprovado' THEN 1 END) as aprovados,
                COUNT(CASE WHEN e.resultado = 'Reprovado' THEN 1 END) as reprovados
            FROM exames e
            JOIN matriculas m ON e.id_matricula = m.id_matricula
            ${schoolFilter}
            GROUP BY e.tipo_exame
            ORDER BY total DESC
        `, params);

        // Taxa de aprovação por mês
        const [approvalRate] = await pool.execute(`
            SELECT 
                DATE_FORMAT(e.data_exame, '%Y-%m') as mes,
                COUNT(*) as total_exames,
                COUNT(CASE WHEN e.resultado = 'Aprovado' THEN 1 END) as aprovados,
                ROUND((COUNT(CASE WHEN e.resultado = 'Aprovado' THEN 1 END) / COUNT(*)) * 100, 2) as taxa_aprovacao
            FROM exames e
            JOIN matriculas m ON e.id_matricula = m.id_matricula
            ${schoolFilter}
            WHERE e.data_exame >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(e.data_exame, '%Y-%m')
            ORDER BY mes DESC
        `, params);

        const stats = {
            examTypes,
            approvalRate
        };

        return dashboardResponse(res, stats, 'Estatísticas de exames recuperadas com sucesso');

    } catch (error) {
        console.error('Erro ao obter estatísticas de exames:', error);
        return errorResponse(res, 'Erro ao obter estatísticas de exames', 500, error);
    }
};

/**
 * Obter dados para gráficos
 */
exports.getChartData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userSchools = req.user.escolas;

        let schoolFilter = '';
        let params = [];

        if (userRole !== 1 && userSchools.length > 0) {
            schoolFilter = 'WHERE id_escola IN (' + userSchools.map(() => '?').join(',') + ')';
            params = userSchools;
        }

        // Alunos por mês (últimos 12 meses)
        const [studentsByMonth] = await pool.execute(`
            SELECT 
                DATE_FORMAT(data_criacao, '%Y-%m') as mes,
                COUNT(*) as novos_alunos
            FROM alunos
            ${schoolFilter}
            WHERE data_criacao >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(data_criacao, '%Y-%m')
            ORDER BY mes
        `, params);

        // Matrículas por mês
        const [enrollmentsByMonth] = await pool.execute(`
            SELECT 
                DATE_FORMAT(data_matricula, '%Y-%m') as mes,
                COUNT(*) as novas_matriculas,
                SUM(custo_total_curso) as receita
            FROM matriculas
            ${schoolFilter}
            WHERE data_matricula >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(data_matricula, '%Y-%m')
            ORDER BY mes
        `, params);

        // Categorias de carta mais populares
        const [popularCategories] = await pool.execute(`
            SELECT 
                cc.codigo_categoria,
                cc.descricao,
                COUNT(m.id_matricula) as total_matriculas
            FROM categoriascarta cc
            LEFT JOIN matriculas m ON cc.id_categoria = m.id_categoria_carta
            ${schoolFilter ? 'AND m.id_escola IN (' + userSchools.map(() => '?').join(',') + ')' : ''}
            GROUP BY cc.id_categoria, cc.codigo_categoria, cc.descricao
            ORDER BY total_matriculas DESC
            LIMIT 10
        `, params);

        const chartData = {
            studentsByMonth,
            enrollmentsByMonth,
            popularCategories
        };

        return dashboardResponse(res, chartData, 'Dados para gráficos recuperados com sucesso');

    } catch (error) {
        console.error('Erro ao obter dados para gráficos:', error);
        return errorResponse(res, 'Erro ao obter dados para gráficos', 500, error);
    }
}; 