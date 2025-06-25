const express = require("express");
const router = express.Router();
const alunoController = require("../controllers/alunoController");
const { authenticateToken, authorizeRoles, authorizeSchool } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Rotas protegidas
router.post("/", authenticateToken, authorizeRoles(1, 2, 4), authorizeSchool, alunoController.createAluno); // Super Admin (1), Admin Escola (2), Gestor Escola Específica (4)
router.get("/", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), alunoController.getAllAlunos); // Todos com acesso a alunos (incluindo instrutor 5)
router.get("/escolas-atribuidas", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), alunoController.getAlunosEscolasAtribuidas); // Alunos das escolas atribuídas ao usuário
router.get("/:id", authenticateToken, authorizeRoles(1, 2, 3, 4, 5), alunoController.getAlunoById);
router.put("/:id", authenticateToken, authorizeRoles(1, 2, 4), authorizeSchool, alunoController.updateAluno);
router.delete("/:id", authenticateToken, authorizeRoles(1, 2), alunoController.deleteAluno); // Super Admin (1), Admin Escola (2)
router.get("/escola/:id_escola", authenticateToken, authorizeRoles(1, 2, 3, 4), authorizeSchool, alunoController.getAlunosPorEscola);
router.get("/dividas", authenticateToken, authorizeRoles(1, 2, 3, 4), alunoController.getAlunosComDividas);
router.post("/importar", authenticateToken, authorizeRoles(1, 2), upload.single("arquivo"), alunoController.importarAlunos);
router.get("/exportar/excel", authenticateToken, authorizeRoles(1, 2, 3, 4), alunoController.exportarAlunosExcel);

module.exports = router;


