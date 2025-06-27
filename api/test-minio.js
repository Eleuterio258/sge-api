const { minioClient, bucketName, testMinioConnection } = require('./config/minio');

async function testMinio() {
    console.log('🧪 Testing MinIO connection...');
    
    try {
        // Test basic connection
        const connectionTest = await testMinioConnection();
        if (!connectionTest) {
            console.log('❌ MinIO connection failed');
            return;
        }
        
        // Test bucket operations
        console.log('📦 Testing bucket operations...');
        const exists = await minioClient.bucketExists(bucketName);
        console.log(`Bucket '${bucketName}' exists: ${exists}`);
        
        if (exists) {
            // Test listing objects
            console.log('📋 Testing list objects...');
            const stream = minioClient.listObjects(bucketName, '', true);
            let objectCount = 0;
            
            stream.on('data', (obj) => {
                objectCount++;
                console.log(`  - ${obj.name} (${obj.size} bytes)`);
            });
            
            stream.on('end', () => {
                console.log(`✅ Found ${objectCount} objects in bucket`);
            });
            
            stream.on('error', (error) => {
                console.error('❌ Error listing objects:', error);
            });
        }
        
        // Test upload (optional)
        console.log('📤 Testing upload...');
        const testData = Buffer.from('Hello MinIO!', 'utf8');
        const testFileName = `test-${Date.now()}.txt`;
        
        await minioClient.putObject(
            bucketName,
            testFileName,
            testData,
            testData.length,
            { 'Content-Type': 'text/plain' }
        );
        console.log(`✅ Test file uploaded: ${testFileName}`);
        
        // Clean up test file
        await minioClient.removeObject(bucketName, testFileName);
        console.log(`✅ Test file cleaned up: ${testFileName}`);
        
    } catch (error) {
        console.error('❌ MinIO test failed:', error);
    }
}

// Run test
testMinio(); 