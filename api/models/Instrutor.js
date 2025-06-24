const pool = require("../config/db");

class Instrutor {
  static async create(instrutorData) {
    const { id_utilizador, cnh, categoria_cnh, data_nascimento, id_escola } = instrutorData;
    const [result] = await pool.execute(
      "INSERT INTO instrutores (id_utilizador, cnh, categoria_cnh, data_nascimento, id_escola) VALUES (?, ?, ?, ?, ?)",
      [id_utilizador, cnh, categoria_cnh, data_nascimento, id_escola]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT i.*, u.nome_completo, u.email, u.telefone, u.id_tipo_utilizador
      FROM instrutores i
      INNER JOIN utilizadores u ON i.id_utilizador = u.id_utilizador
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT i.*, u.nome_completo, u.email, u.telefone, u.id_tipo_utilizador
      FROM instrutores i
      INNER JOIN utilizadores u ON i.id_utilizador = u.id_utilizador
      WHERE i.id_instrutor = ?
    `, [id]);
    return rows[0];
  }

  static async update(id, instrutorData) {
    const { cnh, categoria_cnh, data_nascimento, id_escola } = instrutorData;
    const [result] = await pool.execute(
      "UPDATE instrutores SET cnh = ?, categoria_cnh = ?, data_nascimento = ?, id_escola = ? WHERE id_instrutor = ?",
      [cnh, categoria_cnh, data_nascimento, id_escola, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM instrutores WHERE id_instrutor = ?", [id]);
    return result.affectedRows;
  }

  // Method to get instructor by user ID
  static async getByUserId(userId) {
    const [rows] = await pool.execute(`
      SELECT i.*, u.nome_completo, u.email, u.telefone, u.id_tipo_utilizador
      FROM instrutores i
      INNER JOIN utilizadores u ON i.id_utilizador = u.id_utilizador
      WHERE i.id_utilizador = ?
    `, [userId]);
    return rows[0];
  }
}

module.exports = Instrutor; 