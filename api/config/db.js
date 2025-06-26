const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "mysql",
    user: process.env.DB_USER || "sge_user",
    password: process.env.DB_PASSWORD || "sge_password_2024",
    database: process.env.DB_NAME || "sge_conducao",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    // Configurações adicionais para melhor estabilidade
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Configurações de SSL (se necessário)
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

// Função para testar conexão
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
        console.log(`📊 Database: ${process.env.DB_NAME || 'sge_conducao'}`);
        console.log(`🌐 Host: ${process.env.DB_HOST || 'mysql'}`);
        console.log(`👤 User: ${process.env.DB_USER || 'sge_user'}`);
        console.log(`🔌 Port: ${process.env.DB_PORT || 3306}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Erro ao conectar com MySQL:', err.message);
        console.log('🔧 Verifique se o container MySQL está rodando: docker-compose ps mysql');
        console.log('🔧 Verifique as variáveis de ambiente no docker-compose.yml');
        console.log('🔧 Verifique se o banco de dados foi inicializado corretamente');
        return false;
    }
};

// Testar conexão na inicialização
testConnection();

// Event listeners para monitoramento da conexão
pool.on('connection', (connection) => {
    console.log('🔄 Nova conexão estabelecida com MySQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na pool de conexões MySQL:', err);
});

module.exports = pool;


