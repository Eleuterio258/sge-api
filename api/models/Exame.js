const pool = require("../config/db");

class Exame {
    static async create(exameData) {
        const { id_matricula, numero_tentativa, tipo_exame, data_exame, resultado, observacoes } = exameData;
        const [result] = await pool.execute(
            "INSERT INTO Exames (id_matricula, numero_tentativa, tipo_exame, data_exame, resultado, observacoes) VALUES (?, ?, ?, ?, ?, ?)",
            [id_matricula, numero_tentativa, tipo_exame, data_exame, resultado, observacoes]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM Exames");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM Exames WHERE id_exame = ?", [id]);
        return rows[0];
    }

    static async update(id, exameData) {
        const { id_matricula, numero_tentativa, tipo_exame, data_exame, resultado, observacoes } = exameData;
        const [result] = await pool.execute(
            "UPDATE Exames SET id_matricula = ?, numero_tentativa = ?, tipo_exame = ?, data_exame = ?, resultado = ?, observacoes = ? WHERE id_exame = ?",
            [id_matricula, numero_tentativa, tipo_exame, data_exame, resultado, observacoes, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM Exames WHERE id_exame = ?", [id]);
        return result.affectedRows;
    }
}

module.exports = Exame;


