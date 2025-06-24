const pool = require("../config/db");

class Aula {
    static async create(aulaData) {
        const { id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes } = aulaData;
        const [result] = await pool.execute(
            "INSERT INTO Aulas (id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM Aulas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM Aulas WHERE id_aula = ?", [id]);
        return rows[0];
    }

    static async update(id, aulaData) {
        const { id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes } = aulaData;
        const [result] = await pool.execute(
            "UPDATE Aulas SET id_matricula = ?, id_instrutor = ?, tipo_aula = ?, data_aula = ?, hora_inicio = ?, hora_fim = ?, duracao_minutos = ?, rubrica_aluno = ?, rubrica_instrutor = ?, observacoes = ? WHERE id_aula = ?",
            [id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM Aulas WHERE id_aula = ?", [id]);
        return result.affectedRows;
    }
}

module.exports = Aula;


