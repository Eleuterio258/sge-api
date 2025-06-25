const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Importar rotas
const authRoutes = require("./routes/authRoutes");
const escolaRoutes = require("./routes/escolaRoutes");
const escolaUtilizadorRoutes = require("./routes/escolaUtilizadorRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const categoriaCartaRoutes = require("./routes/categoriaCartaRoutes");
const matriculaRoutes = require("./routes/matriculaRoutes");
const exameRoutes = require("./routes/exameRoutes");
const parcelaRoutes = require("./routes/parcelaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Configuração CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de health check
app.get("/", (req, res) => {
    res.json({
        message: "API SGE-Condução está online!",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota de status da API
app.get("/api/status", (req, res) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/escolas", escolaRoutes);
app.use("/api/escola-utilizadores", escolaUtilizadorRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/categorias-carta", categoriaCartaRoutes);
app.use("/api/matriculas", matriculaRoutes);
app.use("/api/exames", exameRoutes);
app.use("/api/parcelas", parcelaRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Erro interno do servidor',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            message: 'Rota não encontrada',
            path: req.originalUrl
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/status`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});


