const pool = require("../config/db");

class Veiculo {
  static async create(veiculoData) {
    const { placa, modelo, marca, ano, categoria, id_escola, id_instrutor } = veiculoData;
    const [result] = await pool.execute(
      "INSERT INTO pagamentos (placa, modelo, marca, ano, categoria, id_escola, id_instrutor) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [placa, modelo, marca, ano, categoria, id_escola, id_instrutor]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute("SELECT * FROM pagamentos");
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute("SELECT * FROM pagamentos WHERE id_veiculo = ?", [id]);
    return rows[0];
  }

  static async update(id, veiculoData) {
    const { placa, modelo, marca, ano, categoria, id_escola, id_instrutor } = veiculoData;
    const [result] = await pool.execute(
      "UPDATE pagamentos SET placa = ?, modelo = ?, marca = ?, ano = ?, categoria = ?, id_escola = ?, id_instrutor = ? WHERE id_veiculo = ?",
      [placa, modelo, marca, ano, categoria, id_escola, id_instrutor, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM pagamentos WHERE id_veiculo = ?", [id]);
    return result.affectedRows;
  }
}

module.exports = Veiculo; 