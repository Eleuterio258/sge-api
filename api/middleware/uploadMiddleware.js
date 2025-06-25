const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        
        // Criar diretório se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    // Tipos de arquivo permitidos
    const allowedTypes = {
        'image/jpeg': true,
        'image/jpg': true,
        'image/png': true,
        'image/gif': true,
        'application/pdf': true,
        'application/msword': true,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
    };

    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não suportado'), false);
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB padrão
        files: 5 // Máximo 5 arquivos por upload
    }
});

// Middleware para upload de logo da escola
const uploadSchoolLogo = upload.single('logo');

// Middleware para upload de documentos do aluno
const uploadStudentDocuments = upload.fields([
    { name: 'bi', maxCount: 1 },
    { name: 'foto', maxCount: 1 },
    { name: 'certificado_medico', maxCount: 1 }
]);

// Middleware para upload de documentos gerais
const uploadGeneralDocuments = upload.array('documents', 10);

// Middleware para tratamento de erros de upload
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Arquivo muito grande',
                error: 'FILE_TOO_LARGE',
                maxSize: process.env.MAX_FILE_SIZE || '5MB'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Muitos arquivos',
                error: 'TOO_MANY_FILES',
                maxFiles: 10
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Campo de arquivo inesperado',
                error: 'UNEXPECTED_FILE_FIELD'
            });
        }
        
        return res.status(400).json({
            message: 'Erro no upload do arquivo',
            error: 'UPLOAD_ERROR',
            details: error.message
        });
    }
    
    if (error.message === 'Tipo de arquivo não suportado') {
        return res.status(400).json({
            message: 'Tipo de arquivo não suportado',
            error: 'UNSUPPORTED_FILE_TYPE',
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });
    }
    
    next(error);
};

// Função para deletar arquivo
const deleteFile = (filename) => {
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    
    return false;
};

// Função para obter URL do arquivo
const getFileUrl = (filename) => {
    if (!filename) return null;
    return `${process.env.API_URL || 'http://135.181.249.37:4000'}/uploads/${filename}`;
};

// Função para validar se arquivo existe
const fileExists = (filename) => {
    const filePath = path.join(__dirname, '../uploads', filename);
    return fs.existsSync(filePath);
};

module.exports = {
    upload,
    uploadSchoolLogo,
    uploadStudentDocuments,
    uploadGeneralDocuments,
    handleUploadError,
    deleteFile,
    getFileUrl,
    fileExists
}; 