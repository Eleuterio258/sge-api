const pool = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

async function unseedDatabase() {
    try {
        console.log("Iniciando limpeza total do banco de dados...");

        // Desabilitar checagem de chaves estrangeiras
        await pool.execute("SET FOREIGN_KEY_CHECKS = 0");

        // Ordem correta para truncar todas as tabelas
        const tables = [
            "Pagamentos",
            "Parcelas",
            "Aulas",
            "Exames",
            "Matriculas",
            "Escola_Utilizadores",
            "Alunos",
            "utilizadores",
            "Escolas",
            "CategoriasCarta",
            "TiposUtilizador"
        ];

        for (const table of tables) {
            await pool.execute(`TRUNCATE TABLE ${table}`);
            console.log(`Tabela '${table}' limpa.`);
        }

        // Reabilitar checagem de chaves estrangeiras
        await pool.execute("SET FOREIGN_KEY_CHECKS = 1");

        console.log("Banco de dados limpo com sucesso!");
    } catch (error) {
        console.error("Erro durante a limpeza do banco de dados:", error);
    } finally {
        pool.end();
    }
}

unseedDatabase(); 