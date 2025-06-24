const express = require("express");
const router = express.Router();
const exameController = require("../controllers/exameController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), exameController.createExame); // Super Admin (1), Admin Escola (2), Gestor Escola Específica (4)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), exameController.getAllExames); // Todos com acesso a exames
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), exameController.getExameById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4), exameController.updateExame);
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), exameController.deleteExame); // Super Admin (1), Admin Escola (2)

module.exports = router;


