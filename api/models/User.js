const pool = require("../config/db");

class User {
    static async create(userData) {
        const { nome_completo, email, senha_hash, telefone, id_tipo_utilizador } = userData;
        const [result] = await pool.execute(
            "INSERT INTO Utilizadores (nome_completo, email, senha_hash, telefone, id_tipo_utilizador) VALUES (?, ?, ?, ?, ?)",
            [nome_completo, email, senha_hash, telefone, id_tipo_utilizador]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute("SELECT * FROM Utilizadores WHERE email = ?", [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute("SELECT * FROM Utilizadores WHERE id_utilizador = ?", [id]);
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM Utilizadores");
        return rows;
    }

    static async update(id, userData) {
        const { nome_completo, email, telefone, id_tipo_utilizador, ativo, senha_hash } = userData;
        
        // Construir query dinamicamente baseada nos campos fornecidos
        let query = "UPDATE Utilizadores SET ";
        let params = [];
        let updates = [];

        if (nome_completo !== undefined) {
            updates.push("nome_completo = ?");
            params.push(nome_completo);
        }
        if (email !== undefined) {
            updates.push("email = ?");
            params.push(email);
        }
        if (telefone !== undefined) {
            updates.push("telefone = ?");
            params.push(telefone);
        }
        if (id_tipo_utilizador !== undefined) {
            updates.push("id_tipo_utilizador = ?");
            params.push(id_tipo_utilizador);
        }
        if (ativo !== undefined) {
            updates.push("ativo = ?");
            params.push(ativo);
        }
        if (senha_hash !== undefined) {
            updates.push("senha_hash = ?");
            params.push(senha_hash);
        }

        if (updates.length === 0) {
            return 0; // Nenhuma atualização
        }

        query += updates.join(", ") + ", data_atualizacao = NOW() WHERE id_utilizador = ?";
        params.push(id);

        const [result] = await pool.execute(query, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM Utilizadores WHERE id_utilizador = ?", [id]);
        return result.affectedRows;
    }

    static async findByEmailWithTipo(email) {
        const [rows] = await pool.execute(`
            SELECT u.*, t.nome_tipo as nome_tipo_utilizador
            FROM Utilizadores u
            LEFT JOIN TiposUtilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
            WHERE u.email = ?
        `, [email]);
        return rows[0];
    }

    // In User model
    static async findByIdWithTipo(id) {
        const [rows] = await pool.execute(`
        SELECT u.*, t.nome_tipo as nome_tipo_utilizador
        FROM utilizadores u
        LEFT JOIN tiposutilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
        WHERE u.id_utilizador = ?
    `, [id]);
        return rows[0];
    }

    static async findAllWithTipo() {
        const [rows] = await pool.execute(`
            SELECT u.*, t.nome_tipo as nome_tipo_utilizador
            FROM utilizadores u
            LEFT JOIN tiposutilizador t ON u.id_tipo_utilizador = t.id_tipo_utilizador
            ORDER BY u.nome_completo ASC
        `);
        return rows;
    }
}

module.exports = User;


