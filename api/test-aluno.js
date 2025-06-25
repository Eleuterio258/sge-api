const axios = require("axios");

// Test data for creating a student
const testAlunoData = {
    "id_escola": 1,
    "numero_ficha": "FICHA003",
    "nome_completo": "João Silva",
    "apelido": "Santos",
    "data_nascimento": "1995-03-20",
    "estado_civil": "Solteiro(a)",
    "nome_pai": "Manuel Silva",
    "nome_mae": "Maria Santos",
    "local_nascimento": "Maputo",
    "tipo_identificacao": "BI",
    "numero_identificacao": "123456789Z",
    "pais_origem": "Moçambique",
    "profissao": "Engenheiro",
    "endereco": "Av. 25 de Setembro, 456",
    "numero_casa": "15",
    "telefone_principal": "+258841234567",
    "telefone_alternativo": "+258821234567",
    "email": "joao.silva@example.com",
    "genero": "Masculino",
    "foto_url": "http://example.com/joao.jpg"
};

// Valid JWT token (you'll need to replace this with a valid token)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6MSwiZW1haWwiOiJzdXBlcmFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzUwNzY2Nzc0LCJleHAiOjE3NTA3Njc2NzR9.9o5ROm7BC2fLojiU_0fVpcrWrshbBbCGTEHxyWszEt4";

async function testCreateAluno() {
    try {
        console.log("🧪 Testando criação de aluno...");

        const response = await axios.post('http://http://135.181.249.37:4000/api/alunos', testAlunoData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("✅ Aluno criado com sucesso!");
        console.log("📋 Resposta:", response.data);

    } catch (error) {
        console.error("❌ Erro ao criar aluno:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Dados:", error.response.data);
        } else {
            console.error("Erro:", error.message);
        }
    }
}

async function testGetAlunos() {
    try {
        console.log("\n🧪 Testando listagem de alunos...");

        const response = await axios.get('http://http://135.181.249.37:4000/api/alunos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("✅ Alunos listados com sucesso!");
        console.log(`📋 Total de alunos: ${response.data.length}`);

    } catch (error) {
        console.error("❌ Erro ao listar alunos:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Dados:", error.response.data);
        } else {
            console.error("Erro:", error.message);
        }
    }
}

// Run tests
async function runTests() {
    console.log("🚀 Iniciando testes da API de Alunos...\n");

    await testCreateAluno();
    await testGetAlunos();

    console.log("\n✨ Testes concluídos!");
}

// Run if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { testCreateAluno, testGetAlunos }; 