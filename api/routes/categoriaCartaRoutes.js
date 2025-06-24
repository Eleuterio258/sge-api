const express = require("express");
const router = express.Router();
const categoriaCartaController = require("../controllers/categoriaCartaController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2), categoriaCartaController.createCategoriaCarta); // Super Admin (1), Admin Escola (2)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), categoriaCartaController.getAllCategoriasCarta); // Todos com acesso
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), categoriaCartaController.getCategoriaCartaById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2), categoriaCartaController.updateCategoriaCarta);
router.delete("/:id", authenticateToken, authorizeRoles(1), categoriaCartaController.deleteCategoriaCarta); // Apenas Super Admin

module.exports = router;


