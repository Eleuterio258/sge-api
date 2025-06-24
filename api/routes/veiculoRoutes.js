const express = require("express");
const router = express.Router();
const veiculoController = require("../controllers/veiculoController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Criar veículo
router.post("/", authenticateToken, authorizeRoles(1, 2), veiculoController.createVeiculo); // Super Admin, Admin Escola
// Listar todos
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4), veiculoController.getAllveiculos);
// Buscar por ID
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4), veiculoController.getVeiculoById);
// Atualizar
router.put("/:id", authenticateToken, authorizeRoles(1, 2), veiculoController.updateVeiculo);
// Deletar
router.delete("/:id", authenticateToken, authorizeRoles(1), veiculoController.deleteVeiculo);

module.exports = router; 