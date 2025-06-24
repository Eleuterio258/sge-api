const express = require("express");
const router = express.Router();
const aulaController = require("../controllers/aulaController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), aulaController.createAula); // Super Admin (1), Admin Escola (2), Gestor Escola Específica (4)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), aulaController.getAllAulas); // Todos com acesso a aulas
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), aulaController.getAulaById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4, 5), aulaController.updateAula); // Instrutor (5) também pode atualizar
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), aulaController.deleteAula); // Super Admin (1), Admin Escola (2)

module.exports = router;


