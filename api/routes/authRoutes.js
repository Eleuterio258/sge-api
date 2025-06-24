const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Rotas existentes...
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticateToken, authController.logoutAll);
router.get("/me", authenticateToken, authController.me);
router.get("/users", authenticateToken, authorizeRoles(1, 2), authController.allUsers);
router.put("/users/:id", authenticateToken, authorizeRoles(1, 2), authController.updateUser);
router.delete("/users/:id", authenticateToken, authorizeRoles(1, 2), authController.deleteUser);

// Rotas para gestão de escolas-utilizadores
router.post("/atribuir-escola", authenticateToken, authorizeRoles(1, 2), authController.atribuirEscola);
router.delete("/remover-escola", authenticateToken, authorizeRoles(1, 2), authController.removerEscola);
router.get("/escola/:id_escola/utilizadores", authenticateToken, authorizeRoles(1, 2, 3, 4), authController.utilizadoresPorEscola);
router.get("/utilizador/:id_utilizador/escolas", authenticateToken, authorizeRoles(1, 2), authController.escolasPorUtilizador);
router.get("/atribuicoes", authenticateToken, authorizeRoles(1, 2), authController.todasAtribuicoes);
router.get("/atribuicoes/estatisticas", authenticateToken, authorizeRoles(1, 2), authController.estatisticasAtribuicoes);

module.exports = router;