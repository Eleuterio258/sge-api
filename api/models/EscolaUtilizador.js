const pool = require("../config/db");

class EscolaUtilizador {
    // Atribuir usuário a uma escola
    static async atribuirUsuario(id_escola, id_utilizador) {
        try {
            const [result] = await pool.execute(
                "INSERT INTO escola_utilizadores (id_escola, id_utilizador) VALUES (?, ?) ON DUPLICATE KEY UPDATE ativo = 1",
                [id_escola, id_utilizador]
            );
            return result.insertId || result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Remover atribuição de usuário a uma escola
    static async removerAtribuicao(id_escola, id_utilizador) {
        try {
            const [result] = await pool.execute(
                "UPDATE escola_utilizadores SET ativo = 0 WHERE id_escola = ? AND id_utilizador = ?",
                [id_escola, id_utilizador]
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Obter todas as escolas de um usuário
    static async getEscolasByUtilizador(id_utilizador) {
        try {
            const [rows] = await pool.execute(`
                SELECT e.*, eu.data_atribuicao, eu.ativo
                FROM escolas e
                INNER JOIN escola_utilizadores eu ON e.id_escola = eu.id_escola
                WHERE eu.id_utilizador = ? AND eu.ativo = 1
                ORDER BY e.nome_escola
            `, [id_utilizador]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obter todos os usuários de uma escola
    static async getUtilizadoresByEscola(id_escola) {
        try {
            const [rows] = await pool.execute(`
                SELECT u.*, t.nome_tipo as nome_tipo_utilizador, eu.data_atribuicao, eu.ativo
                FROM utilizadores u
                INNER JOIN tiposutilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
                INNER JOIN escola_utilizadores eu ON u.id_utilizador = eu.id_utilizador
                WHERE eu.id_escola = ? AND eu.ativo = 1
                ORDER BY u.nome_completo
            `, [id_escola]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Verificar se usuário está atribuído a uma escola
    static async verificarAtribuicao(id_escola, id_utilizador) {
        try {
            const [rows] = await pool.execute(
                "SELECT * FROM escola_utilizadores WHERE id_escola = ? AND id_utilizador = ? AND ativo = 1",
                [id_escola, id_utilizador]
            );
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Obter todas as atribuições ativas
    static async getAllAtribuicoes() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    eu.id_escola_utilizador,
                    e.id_escola,
                    e.nome_escola,
                    u.id_utilizador,
                    u.nome_completo,
                    u.email,
                    t.nome_tipo as nome_tipo_utilizador,
                    eu.data_atribuicao,
                    eu.ativo
                FROM escola_utilizadores eu
                INNER JOIN escolas e ON eu.id_escola = e.id_escola
                INNER JOIN utilizadores u ON eu.id_utilizador = u.id_utilizador
                INNER JOIN tiposutilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
                WHERE eu.ativo = 1
                ORDER BY e.nome_escola, u.nome_completo
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obter usuários não atribuídos a uma escola específica
    static async getUtilizadoresNaoAtribuidos(id_escola) {
        try {
            const [rows] = await pool.execute(`
                SELECT u.*, t.nome_tipo as nome_tipo_utilizador
                FROM utilizadores u
                INNER JOIN tiposutilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
                WHERE u.ativo = 1 
                AND u.id_utilizador NOT IN (
                    SELECT id_utilizador 
                    FROM escola_utilizadores 
                    WHERE id_escola = ? AND ativo = 1
                )
                ORDER BY u.nome_completo
            `, [id_escola]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obter escolas não atribuídas a um usuário específico
    static async getEscolasNaoAtribuidas(id_utilizador) {
        try {
            const [rows] = await pool.execute(`
                SELECT e.*
                FROM escolas e
                WHERE e.id_escola NOT IN (
                    SELECT id_escola 
                    FROM escola_utilizadores 
                    WHERE id_utilizador = ? AND ativo = 1
                )
                ORDER BY e.nome_escola
            `, [id_utilizador]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EscolaUtilizador;