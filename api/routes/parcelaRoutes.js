const express = require("express");
const router = express.Router();
const parcelaController = require("../controllers/parcelaController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), parcelaController.createParcela); // Super Admin (1), Admin Escola (2), Gestor Escola Específica (4)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4), parcelaController.getAllParcelas); // Todos com acesso a parcelas
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4), parcelaController.getParcelaById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4), parcelaController.updateParcela);
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), parcelaController.deleteParcela); // Super Admin (1), Admin Escola (2)
router.get("/matricula/:matriculaId", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), parcelaController.getParcelasByMatriculaId); // Aluno (5) também pode ver suas parcelas

module.exports = router;


