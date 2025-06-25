const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Estatísticas gerais - Acesso para todos os roles
router.get("/stats/general", dashboardController.getGeneralStats);

// Estatísticas por escola - Acesso para Super Admin e Admin Local
router.get("/stats/schools", authorizeRoles(1, 2), dashboardController.getSchoolStats);

// Estatísticas de pagamentos - Acesso para Super Admin, Admin Local e Financeiro
router.get("/stats/payments", authorizeRoles(1, 2, 3), dashboardController.getPaymentStats);

// Estatísticas de exames - Acesso para todos os roles
router.get("/stats/exams", dashboardController.getExamStats);

// Dados para gráficos - Acesso para todos os roles
router.get("/charts", dashboardController.getChartData);

module.exports = router; 