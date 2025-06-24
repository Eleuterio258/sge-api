const express = require("express");
const router = express.Router();
const escolaUtilizadorController = require("../controllers/escolaUtilizadorController");
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Rotas para atribuições de usuários a escolas
// Apenas Super Admin e Admin Escola podem gerenciar atribuições
router.get("/atribuicoes", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.listarAtribuicoes);
router.post("/atribuir", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.atribuirUsuario);
router.delete("/remover/:id_escola/:id_utilizador", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.removerAtribuicao);

// Rotas para consultas
router.get("/escola/:id_escola/usuarios", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.getUtilizadoresByEscola);
router.get("/usuario/:id_utilizador/escolas", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.getEscolasByUtilizador);
router.get("/escola/:id_escola/usuarios-nao-atribuidos", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.getUtilizadoresNaoAtribuidos);
router.get("/usuario/:id_utilizador/escolas-nao-atribuidas", authenticateToken, authorizeRoles(1, 2), escolaUtilizadorController.getEscolasNaoAtribuidas);

module.exports = router; 