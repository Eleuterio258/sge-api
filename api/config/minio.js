const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    // Configurações adicionais para melhor estabilidade
    region: process.env.MINIO_REGION || 'us-east-1',
    transportOptions: {
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 10,
        maxFreeSockets: 10
    }
});

// Função para testar conexão com MinIO
const testMinioConnection = async () => {
    try {
        // Listar buckets para testar conexão
        const buckets = await minioClient.listBuckets();
        console.log('✅ Conexão com MinIO estabelecida com sucesso!');
        console.log(`🌐 Endpoint: ${process.env.MINIO_ENDPOINT || 'minio'}`);
        console.log(`🔌 Port: ${process.env.MINIO_PORT || 9000}`);
        console.log(`👤 Access Key: ${process.env.MINIO_ACCESS_KEY || 'minioadmin'}`);
        console.log(`📦 Buckets encontrados: ${buckets.length}`);
        
        // Verificar se o bucket padrão existe, se não, criar
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
    } catch (err) {
        console.error('❌ Erro ao conectar com MinIO:', err.message);
        console.log('🔧 Verifique se o container MinIO está rodando: docker-compose ps minio');
        console.log('🔧 Verifique as variáveis de ambiente no docker-compose.yml');
        console.log('🔧 Verifique se as credenciais estão corretas');
        return false;
    }
};

// Testar conexão na inicialização
testMinioConnection();

module.exports = minioClient; 