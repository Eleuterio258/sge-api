const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

async function seedDatabase() {
    try {
        console.log("Iniciando o processo de seeding...");

        // 1. Inserir TiposUtilizador (se não existirem)
        const userTypes = [
            { id: 1, nome_tipo: "Super Admin", descricao: "Administrador com acesso total ao sistema." },
            { id: 2, nome_tipo: "Admin Escola", descricao: "Administrador de uma ou mais escolas específicas." },
            { id: 3, nome_tipo: "Gestor Geral", descricao: "Gestor com visão agregada de todas as escolas." },
            { id: 4, nome_tipo: "Gestor Escola Específica", descricao: "Gestor operacional de uma escola específica." },
            { id: 5, nome_tipo: "Instrutor", descricao: "Instrutor de condução." },
            { id: 6, nome_tipo: "Aluno", descricao: "Aluno matriculado na escola." }
        ];

        for (const type of userTypes) {
            const [rows] = await pool.execute("SELECT id_tipo_utilizador FROM TiposUtilizador WHERE id_tipo_utilizador = ?", [type.id]);
            if (rows.length === 0) {
                await pool.execute("INSERT INTO TiposUtilizador (id_tipo_utilizador, nome_tipo, descricao) VALUES (?, ?, ?)", [type.id, type.nome_tipo, type.descricao]);
                console.log(`Tipo de Usuário '${type.nome_tipo}' inserido.`);
            } else {
                console.log(`Tipo de Usuário '${type.nome_tipo}' já existe.`);
            }
        }

        // 2. Inserir uma Escola de Exemplo (se não existir)
        const escolaData = {
            nome_escola: "Escola de Condução Central",
            endereco: "Av. Julius Nyerere, 100",
            distrito: "Maputo",
            provincia: "Maputo Cidade",
            telefone: "+258841234567",
            email: "central@escola.com",
            nuit: "1234567890",
            logo_url: "https://example.com/logo_central.png"
        };

        let escolaId;
        const [escolaRows] = await pool.execute("SELECT id_escola FROM Escolas WHERE email = ?", [escolaData.email]);
        if (escolaRows.length === 0) {
            const [result] = await pool.execute(
                "INSERT INTO Escolas (nome_escola, endereco, distrito, provincia, telefone, email, nuit, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [escolaData.nome_escola, escolaData.endereco, escolaData.distrito, escolaData.provincia, escolaData.telefone, escolaData.email, escolaData.nuit, escolaData.logo_url]
            );
            escolaId = result.insertId;
            console.log(`Escola '${escolaData.nome_escola}' inserida com ID: ${escolaId}`);
        } else {
            escolaId = escolaRows[0].id_escola;
            console.log(`Escola '${escolaData.nome_escola}' já existe com ID: ${escolaId}`);
        }

        // 3. Inserir um Usuário Super Admin de Exemplo (se não existir)
        const superAdminEmail = "superadmin@example.com";
        const [adminRows] = await pool.execute("SELECT id_utilizador FROM Utilizadores WHERE email = ?", [superAdminEmail]);

        if (adminRows.length === 0) {
            const hashedPassword = await bcrypt.hash("senhaSegura123", 10); // Senha: senhaSegura123
            const [result] = await pool.execute(
                "INSERT INTO Utilizadores (nome_completo, email, senha_hash, telefone, id_tipo_utilizador) VALUES (?, ?, ?, ?, ?)",
                ["Super Admin", superAdminEmail, hashedPassword, "+258840000000", 1] // id_tipo_utilizador 1 para Super Admin
            );
            console.log(`Usuário Super Admin '${superAdminEmail}' inserido com ID: ${result.insertId}`);
        } else {
            console.log(`Usuário Super Admin '${superAdminEmail}' já existe.`);
        }

        // 4. Inserir um Usuário Admin Escola de Exemplo (se não existir)
        const adminEscolaEmail = "adminescola@example.com";
        const [adminEscolaRows] = await pool.execute("SELECT id_utilizador FROM Utilizadores WHERE email = ?", [adminEscolaEmail]);

        if (adminEscolaRows.length === 0) {
            const hashedPassword = await bcrypt.hash("senhaEscola123", 10); // Senha: senhaEscola123
            const [result] = await pool.execute(
                "INSERT INTO Utilizadores (nome_completo, email, senha_hash, telefone, id_tipo_utilizador) VALUES (?, ?, ?, ?, ?)",
                ["Admin da Escola Central", adminEscolaEmail, hashedPassword, "+258841112233", 2] // id_tipo_utilizador 2 para Admin Escola
            );
            const adminEscolaId = result.insertId;
            console.log(`Usuário Admin Escola '${adminEscolaEmail}' inserido com ID: ${adminEscolaId}`);

            // Associar Admin Escola à Escola Central
            const [escolaUserRows] = await pool.execute("SELECT id_escola_utilizador FROM Escola_Utilizadores WHERE id_escola = ? AND id_utilizador = ?", [escolaId, adminEscolaId]);
            if (escolaUserRows.length === 0) {
                await pool.execute("INSERT INTO Escola_Utilizadores (id_escola, id_utilizador) VALUES (?, ?)", [escolaId, adminEscolaId]);
                console.log(`Admin Escola ${adminEscolaId} associado à Escola ${escolaId}.`);
            } else {
                console.log(`Admin Escola ${adminEscolaId} já associado à Escola ${escolaId}.`);
            }

        } else {
            console.log(`Usuário Admin Escola '${adminEscolaEmail}' já existe.`);
        }

        // 5. Inserir Categorias de Carta de Condução (se não existirem)
        const categoriasCarta = [
            { codigo_categoria: "A", descricao: "Motociclos", tipo: "Condução" },
            { codigo_categoria: "A1", descricao: "Motociclos < 125cc", tipo: "Condução" },
            { codigo_categoria: "B", descricao: "Veículos ligeiros (PB/GVM ≤ 3.500 KG)", tipo: "Condução" },
            { codigo_categoria: "C1", descricao: "Pesados ligeiros (PB < 10.000 KG)", tipo: "Condução" },
            { codigo_categoria: "C", descricao: "Pesados (PB < 15.000 KG)", tipo: "Condução" },
            { codigo_categoria: "BE", descricao: "Ligeiro com reboque", tipo: "Condução" },
            { codigo_categoria: "C1E", descricao: "C1 com reboque", tipo: "Condução" },
            { codigo_categoria: "CE", descricao: "C com reboque", tipo: "Condução" }
        ];

        for (const categoria of categoriasCarta) {
            const [rows] = await pool.execute("SELECT id_categoria FROM CategoriasCarta WHERE codigo_categoria = ?", [categoria.codigo_categoria]);
            if (rows.length === 0) {
                await pool.execute(
                    "INSERT INTO CategoriasCarta (codigo_categoria, descricao, tipo) VALUES (?, ?, ?)",
                    [categoria.codigo_categoria, categoria.descricao, categoria.tipo]
                );
                console.log(`Categoria de Carta '${categoria.codigo_categoria}' inserida.`);
            } else {
                console.log(`Categoria de Carta '${categoria.codigo_categoria}' já existe.`);
            }
        }

        console.log("Processo de seeding concluído com sucesso!");
    } catch (error) {
        console.error("Erro durante o seeding do banco de dados:", error);
    } finally {
        pool.end(); // Fechar a conexão com o banco de dados
    }
}

 
seedDatabase();


