const pool = require("../config/db");

class Escola {
    static async create(escolaData) {
        const { nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url } = escolaData;
        const [result] = await pool.execute(
            "INSERT INTO escolas (nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM escolas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM escolas WHERE id_escola = ?", [id]);
        return rows[0];
    }

    static async update(id, escolaData) {
        const { nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url } = escolaData;
        const [result] = await pool.execute(
            "UPDATE escolas SET nome_escola = ?, endereco = ?, distrito = ?, provincia = ?, telefone = ?, email = ?, nuit = ?, logo_url = ? WHERE id_escola = ?",
            [nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM escolas WHERE id_escola = ?", [id]);
        return result.affectedRows;
    }

    static async getDashboardStats(id_escola) {
        // Total de alunos
        const [[{ total_alunos }]] = await pool.execute("SELECT COUNT(*) as total_alunos FROM alunos WHERE id_escola = ?", [id_escola]);
        // Total de matrículas
        const [[{ total_matriculas }]] = await pool.execute("SELECT COUNT(*) as total_matriculas FROM matriculas WHERE id_escola = ?", [id_escola]);
        // Total de parcelas pendentes
        const [[{ total_parcelas_pendentes }]] = await pool.execute(`
            SELECT COUNT(*) as total_parcelas_pendentes
            FROM parcelas p
            JOIN matriculas m ON p.id_matricula = m.id_matricula
            WHERE m.id_escola = ? AND p.status_parcela != 'Paga'
        `, [id_escola]);
        // Total recebido em pagamentos
        const [[{ total_pago }]] = await pool.execute(`
            SELECT COALESCE(SUM(pg.valor_pago),0) as total_pago
            FROM Pagamentos pg
            JOIN matriculas m ON pg.id_matricula = m.id_matricula
            WHERE m.id_escola = ?
        `, [id_escola]);
        return {
            total_alunos,
            total_matriculas,
            total_parcelas_pendentes,
            total_pago
        };
    }

    static async getDashboardStatsGeral() {
        // Total de alunos
        const [[{ total_alunos }]] = await pool.execute("SELECT COUNT(*) as total_alunos FROM alunos");
        // Total de matrículas
        const [[{ total_matriculas }]] = await pool.execute("SELECT COUNT(*) as total_matriculas FROM matriculas");
        // Total de parcelas pendentes
        const [[{ total_parcelas_pendentes }]] = await pool.execute(`
            SELECT COUNT(*) as total_parcelas_pendentes
            FROM parcelas p
            WHERE p.status_parcela != 'Paga'
        `);
        // Total recebido em pagamentos
        const [[{ total_pago }]] = await pool.execute(`
            SELECT COALESCE(SUM(valor_pago),0) as total_pago
            FROM Pagamentos
        `);
        return {
            total_alunos,
            total_matriculas,
            total_parcelas_pendentes,
            total_pago
        };
    }

    static async getAtividadesRecentes() {
        // Matrículas recentes
        const [matriculas] = await pool.execute(`
            SELECT m.data_matricula as data_evento, 'matricula' as tipo, CONCAT('Nova matrícula: ', a.nome_completo) as mensagem, m.id_escola
            FROM matriculas m
            JOIN alunos a ON m.id_aluno = a.id_aluno
            ORDER BY m.data_matricula DESC
            LIMIT 10
        `);
        // Pagamentos recentes
        const [pagamentos] = await pool.execute(`
            SELECT p.data_pagamento as data_evento, 'pagamento' as tipo, CONCAT('Pagamento recebido: ', a.nome_completo) as mensagem, m.id_escola
            FROM pagamentos p
            JOIN matriculas m ON p.id_matricula = m.id_matricula
            JOIN alunos a ON m.id_aluno = a.id_aluno
            ORDER BY p.data_pagamento DESC
            LIMIT 10
        `);
        // Aulas agendadas recentemente
        const [aulas] = await pool.execute(`
            SELECT CONCAT(a.data_aula, ' ', a.hora_inicio) as data_evento, 'aula' as tipo, CONCAT('Aula agendada: ', al.nome_completo) as mensagem, m.id_escola
            FROM aulas a
            JOIN matriculas m ON a.id_matricula = m.id_matricula
            JOIN alunos al ON m.id_aluno = al.id_aluno
            ORDER BY a.data_aula DESC, a.hora_inicio DESC
            LIMIT 10
        `);
        // Exames aprovados recentemente
        const [exames] = await pool.execute(`
            SELECT e.data_exame as data_evento, 'exame' as tipo, CONCAT('Exame aprovado: ', a.nome_completo) as mensagem, m.id_escola
            FROM exames e
            JOIN matriculas m ON e.id_matricula = m.id_matricula
            JOIN alunos a ON m.id_aluno = a.id_aluno
            WHERE e.resultado = 'Aprovado'
            ORDER BY e.data_exame DESC
            LIMIT 10
        `);
        // Unir e ordenar todos os eventos por data_evento desc
        const todas = [...matriculas, ...pagamentos, ...aulas, ...exames];
        todas.sort((a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime());
        return todas.slice(0, 10);
    }

    static async getConquistasMes() {
        const now = new Date();
        const ano = now.getFullYear();
        const mes = (now.getMonth() + 1).toString().padStart(2, '0');
        // Exames aprovados no mês
        const [[{ aprovados }]] = await pool.execute(`
            SELECT COUNT(*) as aprovados FROM exames 
            WHERE resultado = 'Aprovado' AND DATE_FORMAT(data_exame, '%Y-%m') = ?
        `, [`${ano}-${mes}`]);
        // Novas matrículas no mês
        const [[{ matriculas }]] = await pool.execute(`
            SELECT COUNT(*) as matriculas FROM matriculas 
            WHERE DATE_FORMAT(data_matricula, '%Y-%m') = ?
        `, [`${ano}-${mes}`]);
        // Receita do mês
        const [[{ receita }]] = await pool.execute(`
            SELECT COALESCE(SUM(valor_pago),0) as receita FROM pagamentos 
            WHERE DATE_FORMAT(data_pagamento, '%Y-%m') = ?
        `, [`${ano}-${mes}`]);
        return { aprovados, matriculas, receita };
    }

    static async getPendencias() {
        // Pagamentos em atraso
        const [[{ pagamentos }]] = await pool.execute(`
            SELECT COUNT(*) as pagamentos FROM parcelas WHERE status_parcela != 'Paga'
        `);
        // Documentos vencidos e veículos em manutenção não implementados
        return {
            pagamentos,
            documentos: 0,
            manutencao: 0
        };
    }
}

module.exports = Escola;


