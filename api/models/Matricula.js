const pool = require("../config/db");

class Matricula {
    static async create(matriculaData) {
        const { id_aluno, id_escola, id_categoria_carta, data_inicio_curso, horario_inicio_curso, duracao_contrato_meses, custo_total_curso, status_matricula, data_fim_instrucao } = matriculaData;
        const [result] = await pool.execute(
            "INSERT INTO Matriculas (id_aluno, id_escola, id_categoria_carta, data_inicio_curso, horario_inicio_curso, duracao_contrato_meses, custo_total_curso, status_matricula, data_fim_instrucao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_aluno, id_escola, id_categoria_carta, data_inicio_curso, horario_inicio_curso, duracao_contrato_meses, custo_total_curso, status_matricula, data_fim_instrucao]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM Matriculas");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM Matriculas WHERE id_matricula = ?", [id]);
        return rows[0];
    }

    static async update(id, matriculaData) {
        const { id_aluno, id_escola, id_categoria_carta, data_inicio_curso, horario_inicio_curso, duracao_contrato_meses, custo_total_curso, status_matricula, data_fim_instrucao } = matriculaData;
        const [result] = await pool.execute(
            "UPDATE Matriculas SET id_aluno = ?, id_escola = ?, id_categoria_carta = ?, data_inicio_curso = ?, horario_inicio_curso = ?, duracao_contrato_meses = ?, custo_total_curso = ?, status_matricula = ?, data_fim_instrucao = ? WHERE id_matricula = ?",
            [id_aluno, id_escola, id_categoria_carta, data_inicio_curso, horario_inicio_curso, duracao_contrato_meses, custo_total_curso, status_matricula, data_fim_instrucao, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM Matriculas WHERE id_matricula = ?", [id]);
        return result.affectedRows;
    }

    static async getByAlunoId(id_aluno) {
        const [rows] = await pool.execute("SELECT * FROM Matriculas WHERE id_aluno = ?", [id_aluno]);
        return rows;
    }
}

module.exports = Matricula;


