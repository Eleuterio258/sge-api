const pool = require("../config/db");

class Instrutor {
  static async create(instrutorData) {
    const { nome, email, telefone, cnh, categoria_cnh, data_nascimento, id_escola } = instrutorData;
    const [result] = await pool.execute(
      "INSERT INTO Instrutores (nome, email, telefone, cnh, categoria_cnh, data_nascimento, id_escola) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nome, email, telefone, cnh, categoria_cnh, data_nascimento, id_escola]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute("SELECT * FROM Instrutores");
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM Instrutores WHERE id_instrutor = ?", [id]);
    return rows[0];
  }

  static async update(id, instrutorData) {
    const { nome, email, telefone, cnh, categoria_cnh, data_nascimento, id_escola } = instrutorData;
    const [result] = await pool.execute(
      "UPDATE Instrutores SET nome = ?, email = ?, telefone = ?, cnh = ?, categoria_cnh = ?, data_nascimento = ?, id_escola = ? WHERE id_instrutor = ?",
      [nome, email, telefone, cnh, categoria_cnh, data_nascimento, id_escola, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM Instrutores WHERE id_instrutor = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Instrutor; 