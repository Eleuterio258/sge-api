const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('🚀 Iniciando inicialização do banco de dados...');
        
        // Conectar sem especificar banco de dados
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        
        console.log('✅ Conectado ao MySQL');
        
        // Ler arquivo SQL
        const sqlFilePath = path.join(__dirname, '../sge_conducao_db.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('📖 Arquivo SQL carregado');
        
        // Executar script SQL
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✅ Comando SQL executado');
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.error('❌ Erro ao executar comando SQL:', error.message);
                    }
                }
            }
        }
        
        console.log('✅ Banco de dados inicializado com sucesso!');
        
        // Executar seed se solicitado
        if (process.argv.includes('--seed')) {
            console.log('🌱 Executando seed do banco de dados...');
            const { exec } = require('child_process');
            
            exec('npm run seed', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Erro ao executar seed:', error);
                    return;
                }
                console.log('✅ Seed executado com sucesso!');
                console.log(stdout);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexão com banco de dados fechada');
        }
    }
}

// Verificar se o script foi chamado diretamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase }; 