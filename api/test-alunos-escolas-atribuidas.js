const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'seu_token_jwt_aqui'; // Substitua pelo token real

// Função para testar o endpoint de alunos das escolas atribuídas
async function testarAlunosEscolasAtribuidas() {
    try {
        console.log('🔄 Testando endpoint de alunos das escolas atribuídas...\n');

        const response = await axios.get(`${API_BASE_URL}/alunos/escolas-atribuidas`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Sucesso! Resposta recebida:');
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        console.log('Message:', response.data.message);
        
        if (response.data.total_alunos !== undefined) {
            console.log('Total de alunos:', response.data.total_alunos);
            console.log('Número de alunos retornados:', response.data.alunos?.length || 0);
        } else if (response.data.escolas_alunos) {
            console.log('Total de escolas:', response.data.total_escolas);
            console.log('Total de alunos:', response.data.total_alunos);
            
            response.data.escolas_alunos.forEach((escola, index) => {
                console.log(`\n📚 Escola ${index + 1} (ID: ${escola.id_escola}):`);
                console.log(`   - Total de alunos: ${escola.total_alunos_escola}`);
                console.log(`   - Primeiros 3 alunos:`);
                escola.alunos.slice(0, 3).forEach((aluno, alunoIndex) => {
                    console.log(`     ${alunoIndex + 1}. ${aluno.nome_completo} (${aluno.numero_ficha})`);
                });
                if (escola.alunos.length > 3) {
                    console.log(`     ... e mais ${escola.alunos.length - 3} alunos`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Erro ao testar endpoint:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Mensagem:', error.response.data.message);
            console.error('Dados:', error.response.data);
        } else if (error.request) {
            console.error('Erro de rede:', error.message);
        } else {
            console.error('Erro:', error.message);
        }
    }
}

// Função para comparar com o endpoint de escola específica
async function compararComEscolaEspecifica(idEscola) {
    try {
        console.log(`\n🔄 Comparando com endpoint de escola específica (ID: ${idEscola})...\n`);

        const response = await axios.get(`${API_BASE_URL}/alunos/escola/${idEscola}`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Endpoint de escola específica:');
        console.log('Status:', response.status);
        console.log('Número de alunos:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('Primeiros 3 alunos:');
            response.data.slice(0, 3).forEach((aluno, index) => {
                console.log(`  ${index + 1}. ${aluno.nome_completo} (${aluno.numero_ficha})`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao testar endpoint de escola específica:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Mensagem:', error.response.data.message);
        } else {
            console.error('Erro:', error.message);
        }
    }
}

// Função principal
async function main() {
    console.log('🚀 Iniciando testes do endpoint de alunos das escolas atribuídas\n');
    
    // Teste principal
    await testarAlunosEscolasAtribuidas();
    
    // Teste comparativo (descomente se quiser testar)
    // await compararComEscolaEspecifica(1);
    
    console.log('\n✨ Testes concluídos!');
}

// Executar se o arquivo for chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testarAlunosEscolasAtribuidas,
    compararComEscolaEspecifica
}; 