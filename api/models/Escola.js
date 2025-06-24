const pool = require("../config/db");

class Escola {
    static async create(escolaData) {
        const { nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url } = escolaData;
        const [result] = await pool.execute(
            "INSERT INTO Escolas (nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM Escolas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM Escolas WHERE id_escola = ?", [id]);
        return rows[0];
    }

    static async update(id, escolaData) {
        const { nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url } = escolaData;
        const [result] = await pool.execute(
            "UPDATE Escolas SET nome_escola = ?, endereco = ?, distrito = ?, provincia = ?, telefone = ?, email = ?, nuit = ?, logo_url = ? WHERE id_escola = ?",
            [nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM Escolas WHERE id_escola = ?", [id]);
        return result.affectedRows;
    }

    static async getDashboardStats(id_escola) {
        // Total de alunos
        const [[{ total_alunos }]] = await pool.execute("SELECT COUNT(*) as total_alunos FROM Alunos WHERE id_escola = ?", [id_escola]);
        // Total de matrículas
        const [[{ total_matriculas }]] = await pool.execute("SELECT COUNT(*) as total_matriculas FROM Matriculas WHERE id_escola = ?", [id_escola]);
        // Total de parcelas pendentes
        const [[{ total_parcelas_pendentes }]] = await pool.execute(`
            SELECT COUNT(*) as total_parcelas_pendentes
            FROM Parcelas p
            JOIN Matriculas m ON p.id_matricula = m.id_matricula
            WHERE m.id_escola = ? AND p.status_parcela != 'Paga'
        `, [id_escola]);
        // Total recebido em pagamentos
        const [[{ total_pago }]] = await pool.execute(`
            SELECT COALESCE(SUM(pg.valor_pago),0) as total_pago
            FROM Pagamentos pg
            JOIN Matriculas m ON pg.id_matricula = m.id_matricula
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
        const [[{ total_alunos }]] = await pool.execute("SELECT COUNT(*) as total_alunos FROM Alunos");
        // Total de matrículas
        const [[{ total_matriculas }]] = await pool.execute("SELECT COUNT(*) as total_matriculas FROM Matriculas");
        // Total de parcelas pendentes
        const [[{ total_parcelas_pendentes }]] = await pool.execute(`
            SELECT COUNT(*) as total_parcelas_pendentes
            FROM Parcelas p
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
}

module.exports = Escola;


