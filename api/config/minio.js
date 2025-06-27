const Minio = require('minio');

// Configure MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '18.206.244.149',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false, // Tentar sem SSL primeiro
  accessKey: process.env.MINIO_ACCESS_KEY || '2Q5RUtRKyfLUbzbg9XFd',
  secretKey: process.env.MINIO_SECRET_KEY || 'gQY3RZUWALihYn72PZzRl8Bbfjc7AmNYcR5wGtpk'
});

// Client alternativo com SSL para teste
const minioClientSSL = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '18.206.244.149',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: true, // Tentar com SSL
  accessKey: process.env.MINIO_ACCESS_KEY || '2Q5RUtRKyfLUbzbg9XFd',
  secretKey: process.env.MINIO_SECRET_KEY || 'gQY3RZUWALihYn72PZzRl8Bbfjc7AmNYcR5wGtpk'
});

const bucketName = process.env.MINIO_BUCKET || 'vaga-livre-files';

// Ensure bucket exists and is public
const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket '${bucketName}' created successfully.`);
    }
    
    // Configure bucket policy for public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };
    
    try {
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Bucket '${bucketName}' policy set for public read access.`);
    } catch (policyError) {
      console.log(`⚠️ Could not set bucket policy (this is normal if already set): ${policyError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error ensuring bucket exists:', error);
    
    // Tentar com SSL se falhar sem SSL
    try {
      console.log('🔄 Trying with SSL...');
      const existsSSL = await minioClientSSL.bucketExists(bucketName);
      if (!existsSSL) {
        await minioClientSSL.makeBucket(bucketName, 'us-east-1');
        console.log(`✅ Bucket '${bucketName}' created successfully with SSL.`);
      }
    } catch (sslError) {
      console.error('❌ SSL connection also failed:', sslError);
    }
  }
};

// Initialize bucket on module load
ensureBucket();

// Test MinIO connection
const testMinioConnection = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    console.log(`✅ MinIO connection test successful. Bucket '${bucketName}' exists: ${exists}`);
    return true;
  } catch (error) {
    console.error('❌ MinIO connection test failed:', error);
    
    // Tentar com SSL
    try {
      const existsSSL = await minioClientSSL.bucketExists(bucketName);
      console.log(`✅ MinIO SSL connection test successful. Bucket '${bucketName}' exists: ${existsSSL}`);
      return true;
    } catch (sslError) {
      console.error('❌ MinIO SSL connection test also failed:', sslError);
      return false;
    }
  }
};

// Test connection on startup
testMinioConnection();

module.exports = {
  minioClient,
  minioClientSSL,
  bucketName,
  ensureBucket,
  testMinioConnection
}; 