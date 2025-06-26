const mysql = require('mysql2/promise');
const Minio = require('minio');

// Configurações de teste
const dbConfig = {
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'sge_user',
    password: process.env.DB_PASSWORD || 'sge_password_2024',
    database: process.env.DB_NAME || 'sge_conducao',
    port: process.env.DB_PORT || 3306
};

const minioConfig = {
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
};

// Função para testar conexão MySQL
async function testMySQLConnection() {
    console.log('🔍 Testando conexão MySQL...');
    console.log(`📊 Configurações: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Testar query simples
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
        console.log('✅ Conexão MySQL: OK');
        console.log(`📊 Resultado do teste: ${JSON.stringify(rows[0])}`);
        
        // Verificar tabelas existentes
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tabelas encontradas: ${tables.length}`);
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão MySQL:', error.message);
        return false;
    }
}

// Função para testar conexão MinIO
async function testMinioConnection() {
    console.log('\n🔍 Testando conexão MinIO...');
    console.log(`📊 Configurações: ${minioConfig.endPoint}:${minioConfig.port}`);
    
    try {
        const minioClient = new Minio.Client(minioConfig);
        
        // Listar buckets
        const buckets = await minioClient.listBuckets();
        console.log('✅ Conexão MinIO: OK');
        console.log(`📦 Buckets encontrados: ${buckets.length}`);
        
        buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (criado em: ${bucket.creationDate})`);
        });
        
        // Verificar bucket padrão
        const defaultBucket = process.env.MINIO_BUCKET || 'sge-files';
        const bucketExists = buckets.some(bucket => bucket.name === defaultBucket);
        
        if (!bucketExists) {
            console.log(`📦 Criando bucket padrão: ${defaultBucket}`);
            await minioClient.makeBucket(defaultBucket, process.env.MINIO_REGION || 'us-east-1');
            console.log(`✅ Bucket ${defaultBucket} criado com sucesso!`);
        } else {
            console.log(`✅ Bucket ${defaultBucket} já existe`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão MinIO:', error.message);
        return false;
    }
}

// Função para testar API
async function testAPIConnection() {
    console.log('\n🔍 Testando conexão API...');
    
    try {
        const response = await fetch('http://localhost:4000/api/status');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexão API: OK');
            console.log(`📊 Status: ${data.status}`);
            console.log(`⏰ Uptime: ${data.uptime}s`);
            console.log(`🌍 Environment: ${data.environment}`);
            return true;
        } else {
            console.error('❌ API retornou status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro na conexão API:', error.message);
        return false;
    }
}

// Função principal
async function runAllTests() {
    console.log('🚀 Iniciando testes de conexão...\n');
    
    const results = {
        mysql: await testMySQLConnection(),
        minio: await testMinioConnection(),
        api: await testAPIConnection()
    };
    
    console.log('\n📊 Resumo dos testes:');
    console.log(`MySQL: ${results.mysql ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`MinIO: ${results.minio ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`API: ${results.api ? '✅ OK' : '❌ FALHOU'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique as configurações.');
        process.exit(1);
    }
}

// Executar testes
runAllTests().catch(error => {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
}); 