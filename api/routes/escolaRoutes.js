const express = require("express");
const router = express.Router();
const escolaController = require("../controllers/escolaController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2), escolaController.createEscola); // Super Admin (1), Admin Escola (2)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4), escolaController.getAllEscolas); // Todos com acesso a escolas
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4), escolaController.getEscolaById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2), escolaController.updateEscola);
router.delete("/:id", authenticateToken, authorizeRoles(1), escolaController.deleteEscola); // Apenas Super Admin
router.get("/:id_escola/dashboard", authenticateToken, authorizeRoles(1, 2, 3, 4), escolaController.getDashboardStats);
router.get("/dashboard/geral", authenticateToken, authorizeRoles(1, 2, 3, 4), escolaController.getDashboardStatsGeral);
router.get("/atividades/recentes", authenticateToken, authorizeRoles(1), escolaController.getAtividadesRecentes);
router.get("/conquistas/mes", authenticateToken, authorizeRoles(1), escolaController.getConquistasMes);
router.get("/pendencias", authenticateToken, authorizeRoles(1), escolaController.getPendencias);

module.exports = router;


