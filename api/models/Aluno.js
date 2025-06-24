const pool = require("../config/db");
const Matricula = require("./Matricula");
const Parcela = require("./Parcela");
const Pagamento = require("./Pagamento");

class Aluno {
    static async create(alunoData) {
        const { id_escola, numero_ficha, nome_completo, apelido, data_nascimento, estado_civil, nome_pai, nome_mae, local_nascimento, tipo_identificacao, numero_identificacao, pais_origem, profissao, endereco, numero_casa, telefone_principal, telefone_alternativo, email, genero, foto_url } = alunoData;
        const [result] = await pool.execute(
            "INSERT INTO alunos (id_escola, numero_ficha, nome_completo, apelido, data_nascimento, estado_civil, nome_pai, nome_mae, local_nascimento, tipo_identificacao, numero_identificacao, pais_origem, profissao, endereco, numero_casa, telefone_principal, telefone_alternativo, email, genero, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id_escola, numero_ficha, nome_completo, apelido, data_nascimento, estado_civil, nome_pai, nome_mae, local_nascimento, tipo_identificacao, numero_identificacao, pais_origem, profissao, endereco, numero_casa, telefone_principal, telefone_alternativo, email, genero, foto_url]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM alunos");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM alunos WHERE id_aluno = ?", [id]);
        return rows[0];
    }

    static async update(id, alunoData) {
        const { id_escola, numero_ficha, nome_completo, apelido, data_nascimento, estado_civil, nome_pai, nome_mae, local_nascimento, tipo_identificacao, numero_identificacao, pais_origem, profissao, endereco, numero_casa, telefone_principal, telefone_alternativo, email, genero, foto_url } = alunoData;
        const [result] = await pool.execute(
            "UPDATE alunos SET id_escola = ?, numero_ficha = ?, nome_completo = ?, apelido = ?, data_nascimento = ?, estado_civil = ?, nome_pai = ?, nome_mae = ?, local_nascimento = ?, tipo_identificacao = ?, numero_identificacao = ?, pais_origem = ?, profissao = ?, endereco = ?, numero_casa = ?, telefone_principal = ?, telefone_alternativo = ?, email = ?, genero = ?, foto_url = ? WHERE id_aluno = ?",
            [id_escola, numero_ficha, nome_completo, apelido, data_nascimento, estado_civil, nome_pai, nome_mae, local_nascimento, tipo_identificacao, numero_identificacao, pais_origem, profissao, endereco, numero_casa, telefone_principal, telefone_alternativo, email, genero, foto_url, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM alunos WHERE id_aluno = ?", [id]);
        return result.affectedRows;
    }

    static async getAllWithFinanceiro() {
        const [alunos] = await pool.execute("SELECT * FROM alunos");
        for (const aluno of alunos) {
            aluno.matriculas = await Matricula.getByAlunoId(aluno.id_aluno);
            for (const matricula of aluno.matriculas) {
                matricula.parcelas = await Parcela.getByMatriculaId(matricula.id_matricula);
                matricula.pagamentos = await Pagamento.getByMatriculaId(matricula.id_matricula);
            }
        }
        return alunos;
    }

    static async getByEscolaId(id_escola) {
        const [alunos] = await pool.execute("SELECT * FROM alunos WHERE id_escola = ?", [id_escola]);
        for (const aluno of alunos) {
            aluno.matriculas = await Matricula.getByAlunoId(aluno.id_aluno);
            for (const matricula of aluno.matriculas) {
                matricula.parcelas = await Parcela.getByMatriculaId(matricula.id_matricula);
                matricula.pagamentos = await Pagamento.getByMatriculaId(matricula.id_matricula);
            }
        }
        return alunos;
    }

    static async getAlunosComDividas() {
        const [alunos] = await pool.execute("SELECT * FROM alunos");
        const alunosComDividas = [];
        for (const aluno of alunos) {
            aluno.matriculas = await Matricula.getByAlunoId(aluno.id_aluno);
            let temDivida = false;
            for (const matricula of aluno.matriculas) {
                matricula.parcelas = await Parcela.getByMatriculaId(matricula.id_matricula);
                const parcelasPendentes = matricula.parcelas.filter(p => p.status_parcela !== 'Paga');
                if (parcelasPendentes.length > 0) {
                    temDivida = true;
                }
                matricula.pagamentos = await Pagamento.getByMatriculaId(matricula.id_matricula);
            }
            if (temDivida) {
                alunosComDividas.push(aluno);
            }
        }
        return alunosComDividas;
    }
}

module.exports = Aluno;


