const pool = require("../config/db");

class Pagamento {
    static async create(pagamentoData) {
        const { id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes, registado_por } = pagamentoData;
        const [result] = await pool.execute(
            "INSERT INTO pagamentos (id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes, registado_por) VALUES (?, ?, ?, ?, ?, ?)",
            [id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes, registado_por]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await pool.execute("SELECT * FROM pagamentos");
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.execute("SELECT * FROM pagamentos WHERE id_pagamento = ?", [id]);
        return rows[0];
    }

    static async update(id, pagamentoData) {
        const { id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes, registado_por } = pagamentoData;
        const [result] = await pool.execute(
            "UPDATE pagamentos SET id_matricula = ?, id_parcela = ?, valor_pago = ?, metodo_pagamento = ?, observacoes = ?, registado_por = ? WHERE id_pagamento = ?",
            [id_matricula, id_parcela, valor_pago, metodo_pagamento, observacoes, registado_por, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.execute("DELETE FROM pagamentos WHERE id_pagamento = ?", [id]);
        return result.affectedRows;
    }

    static async getByMatriculaId(matriculaId) {
        const [rows] = await pool.execute("SELECT * FROM pagamentos WHERE id_matricula = ?", [matriculaId]);
        return rows;
    }
}

module.exports = Pagamento;


