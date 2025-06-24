const pool = require("../config/db");

class Aula {
    static async create(aulaData) {
        const { id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes } = aulaData;
        const [result] = await pool.execute(
            "INSERT INTO aulas (id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM aulas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM aulas WHERE id_aula = ?", [id]);
        return rows[0];
    }

    static async update(id, aulaData) {
        const { id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes } = aulaData;
        const [result] = await pool.execute(
            "UPDATE aulas SET id_matricula = ?, id_instrutor = ?, tipo_aula = ?, data_aula = ?, hora_inicio = ?, hora_fim = ?, duracao_minutos = ?, rubrica_aluno = ?, rubrica_instrutor = ?, observacoes = ? WHERE id_aula = ?",
            [id_matricula, id_instrutor, tipo_aula, data_aula, hora_inicio, hora_fim, duracao_minutos, rubrica_aluno, rubrica_instrutor, observacoes, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM aulas WHERE id_aula = ?", [id]);
        return result.affectedRows;
    }

    static async getProximasAulas() {
        // Busca as próximas 10 aulas a partir de agora
        const now = new Date();
        const dataAtual = now.toISOString().slice(0, 10); // yyyy-mm-dd
        const horaAtual = now.toTimeString().slice(0, 8); // HH:MM:SS
        const [rows] = await pool.execute(
            `SELECT a.*, m.id_escola, al.nome_completo as nome_aluno, i.nome_completo as nome_instrutor
             FROM aulas a
             JOIN matriculas m ON a.id_matricula = m.id_matricula
             JOIN alunos al ON m.id_aluno = al.id_aluno
             JOIN instrutores i ON a.id_instrutor = i.id_instrutor
             WHERE (a.data_aula > ? OR (a.data_aula = ? AND a.hora_inicio > ?))
             ORDER BY a.data_aula ASC, a.hora_inicio ASC
             LIMIT 10`,
            [dataAtual, dataAtual, horaAtual]
        );
        return rows;
    }
}

module.exports = Aula;


