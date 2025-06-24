const express = require("express");
const router = express.Router();
const matriculaController = require("../controllers/matriculaController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), matriculaController.createMatricula);
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), matriculaController.getAllMatriculas);
router.get("/aluno/:id_aluno", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), matriculaController.getMatriculasByAlunoId); // 👈 NOVA ROTA
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), matriculaController.getMatriculaById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4), matriculaController.updateMatricula);
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), matriculaController.deleteMatricula);

module.exports = router;