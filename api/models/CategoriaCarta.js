const pool = require("../config/db");

class CategoriaCarta {
    static async create(categoriaData) {
        const { codigo_categoria, descricao, tipo, preco } = categoriaData;
        const [result] = await pool.execute(
            "INSERT INTO CategoriasCarta (codigo_categoria, descricao, tipo, preco) VALUES (?, ?, ?, ?)",
            [codigo_categoria, descricao, tipo, preco]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM CategoriasCarta");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM CategoriasCarta WHERE id_categoria = ?", [id]);
        return rows[0];
    }

    static async update(id, categoriaData) {
        const { codigo_categoria, descricao, tipo, preco } = categoriaData;
        const [result] = await pool.execute(
            "UPDATE CategoriasCarta SET codigo_categoria = ?, descricao = ?, tipo = ?, preco = ? WHERE id_categoria = ?",
            [codigo_categoria, descricao, tipo, preco, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM CategoriasCarta WHERE id_categoria = ?", [id]);
        return result.affectedRows;
    }
}

module.exports = CategoriaCarta;


