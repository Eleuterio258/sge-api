const express = require("express");
const router = express.Router();
const instrutorController = require("../controllers/instrutorController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Criar instrutor
router.post("/", authenticateToken, authorizeRoles(1, 2), instrutorController.createInstrutor); // Super Admin, Admin Escola
// Listar todos
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4), instrutorController.getAllInstrutores);
// Buscar por ID
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4), instrutorController.getInstrutorById);
// Atualizar
router.put("/:id", authenticateToken, authorizeRoles(1, 2), instrutorController.updateInstrutor);
// Deletar
router.delete("/:id", authenticateToken, authorizeRoles(1), instrutorController.deleteInstrutor);

module.exports = router; 