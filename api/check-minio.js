const http = require('http');
const https = require('https');

const minioHost = '18.206.244.149';
const minioPort = 9000;

console.log('🔍 Checking MinIO connectivity...');

// Test HTTP connection
const testHTTP = () => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: minioHost,
            port: minioPort,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            console.log(`✅ HTTP connection successful: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (error) => {
            console.log(`❌ HTTP connection failed: ${error.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ HTTP connection timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
};

// Test HTTPS connection
const testHTTPS = () => {
    return new Promise((resolve) => {
        const req = https.request({
            hostname: minioHost,
            port: minioPort,
            path: '/',
            method: 'GET',
            timeout: 5000,
            rejectUnauthorized: false // Ignore SSL certificate issues
        }, (res) => {
            console.log(`✅ HTTPS connection successful: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (error) => {
            console.log(`❌ HTTPS connection failed: ${error.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('❌ HTTPS connection timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
};

// Run tests
async function runTests() {
    console.log(`🌐 Testing connection to ${minioHost}:${minioPort}`);
    
    const httpResult = await testHTTP();
    const httpsResult = await testHTTPS();
    
    if (httpResult || httpsResult) {
        console.log('✅ MinIO server is accessible');
    } else {
        console.log('❌ MinIO server is not accessible');
    }
}

runTests(); 