const pool = require("../config/db");

class Parcela {
    static async create(parcelaData) {
        const { id_matricula, numero_parcela, valor_devido, data_vencimento, status_parcela } = parcelaData;
        const [result] = await pool.execute(
            "INSERT INTO parcelas (id_matricula, numero_parcela, valor_devido, data_vencimento, status_parcela) VALUES (?, ?, ?, ?, ?)",
            [id_matricula, numero_parcela, valor_devido, data_vencimento, status_parcela]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM parcelas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM parcelas WHERE id_parcela = ?", [id]);
        return rows[0];
    }

    static async update(id, parcelaData) {
        const { id_matricula, numero_parcela, valor_devido, data_vencimento, status_parcela } = parcelaData;
        const [result] = await pool.execute(
            "UPDATE parcelas SET id_matricula = ?, numero_parcela = ?, valor_devido = ?, data_vencimento = ?, status_parcela = ? WHERE id_parcela = ?",
            [id_matricula, numero_parcela, valor_devido, data_vencimento, status_parcela, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM parcelas WHERE id_parcela = ?", [id]);
        return result.affectedRows;
    }

    static async getByMatriculaId(matriculaId) {
        const [rows] = await pool.execute("SELECT * FROM parcelas WHERE id_matricula = ? ORDER BY numero_parcela ASC", [matriculaId]);
        return rows;
    }
}

module.exports = Parcela;


