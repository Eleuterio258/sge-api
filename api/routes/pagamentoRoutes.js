const express = require("express");
const router = express.Router();
const pagamentoController = require("../controllers/pagamentoController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rota principal para pagar parcela (valor automático da parcela)
router.post("/pagar", authenticateToken, authorizeRoles(1, 2, 4), pagamentoController.pagarParcela);

// Consultar parcelas disponíveis para pagamento
router.get("/matricula/:matriculaId/disponiveis", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), pagamentoController.getParcelasParaPagamento);

// Consultar histórico de pagamentos de uma matrícula
router.get("/matricula/:matriculaId/historico", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), pagamentoController.getHistoricoPagamentos);

// CRUD básico de pagamentos
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), pagamentoController.pagarParcela); // Alias para /pagar
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4), pagamentoController.getAllPagamentos);
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4), pagamentoController.getPagamentoById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4), pagamentoController.updatePagamento);
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), pagamentoController.deletePagamento);

// Buscar pagamentos por matrícula (alunos também podem ver seus próprios pagamentos)
router.get("/matricula/:matriculaId", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), pagamentoController.getPagamentosByMatriculaId);

module.exports = router;