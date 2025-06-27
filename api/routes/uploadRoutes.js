const express = require('express');
const multer = require('multer');
const { minioClient, minioClientSSL, bucketName } = require('../config/minio');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configuração do multer para upload temporário
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        // Permitir apenas imagens
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

// Função para tentar upload com diferentes clientes
const uploadToMinio = async (fileName, fileBuffer, fileSize, mimetype) => {
    try {
        // Tentar primeiro sem SSL
        await minioClient.putObject(
            bucketName,
            fileName,
            fileBuffer,
            fileSize,
            {
                'Content-Type': mimetype,
            }
        );
        return `http://18.206.244.149:9000/${bucketName}/${fileName}`;
    } catch (error) {
        console.log('❌ Upload without SSL failed, trying with SSL...');
        
        // Tentar com SSL
        await minioClientSSL.putObject(
            bucketName,
            fileName,
            fileBuffer,
            fileSize,
            {
                'Content-Type': mimetype,
            }
        );
        return `https://18.206.244.149:9000/${bucketName}/${fileName}`;
    }
};

// Rota para upload de arquivos
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'Nenhum arquivo enviado' 
            });
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = req.file.originalname.split('.').pop();
        const fileName = `uploads/${timestamp}-${randomString}.${extension}`;

        // Upload para o MinIO
        const fileUrl = await uploadToMinio(
            fileName,
            req.file.buffer,
            req.file.size,
            req.file.mimetype
        );

        console.log(`✅ Arquivo enviado com sucesso: ${fileName}`);

        res.status(200).json({
            message: 'Arquivo enviado com sucesso',
            url: fileUrl,
            fileName: fileName,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

    } catch (error) {
        console.error('❌ Erro no upload:', error);
        res.status(500).json({
            message: 'Erro ao fazer upload do arquivo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rota para deletar arquivo
router.delete('/:fileName', authMiddleware, async (req, res) => {
    try {
        const { fileName } = req.params;
        
        // Deletar arquivo do MinIO (tentar ambos os clientes)
        try {
            await minioClient.removeObject(bucketName, fileName);
        } catch (error) {
            await minioClientSSL.removeObject(bucketName, fileName);
        }

        console.log(`✅ Arquivo deletado com sucesso: ${fileName}`);

        res.status(200).json({
            message: 'Arquivo deletado com sucesso',
            fileName: fileName
        });

    } catch (error) {
        console.error('❌ Erro ao deletar arquivo:', error);
        res.status(500).json({
            message: 'Erro ao deletar arquivo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rota para listar arquivos (opcional)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let stream;
        try {
            stream = minioClient.listObjects(bucketName, 'uploads/', true);
        } catch (error) {
            stream = minioClientSSL.listObjects(bucketName, 'uploads/', true);
        }
        
        const files = [];

        stream.on('data', (obj) => {
            files.push({
                name: obj.name,
                size: obj.size,
                lastModified: obj.lastModified
            });
        });

        stream.on('end', () => {
            res.status(200).json({
                message: 'Arquivos listados com sucesso',
                files: files
            });
        });

        stream.on('error', (error) => {
            console.error('❌ Erro ao listar arquivos:', error);
            res.status(500).json({
                message: 'Erro ao listar arquivos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });

    } catch (error) {
        console.error('❌ Erro ao listar arquivos:', error);
        res.status(500).json({
            message: 'Erro ao listar arquivos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 