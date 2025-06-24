const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const escolaRoutes = require("./routes/escolaRoutes");
const escolaUtilizadorRoutes = require("./routes/escolaUtilizadorRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const categoriaCartaRoutes = require("./routes/categoriaCartaRoutes");
const matriculaRoutes = require("./routes/matriculaRoutes");
const aulaRoutes = require("./routes/aulaRoutes");
const exameRoutes = require("./routes/exameRoutes");
const parcelaRoutes = require("./routes/parcelaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const instrutorRoutes = require("./routes/instrutorRoutes");
const veiculoRoutes = require("./routes/veiculoRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API SGE-Condução está online!");
});

// Rotas de autenticação
app.use("/api/auth", authRoutes);
// Rotas de escolas
app.use("/api/escolas", escolaRoutes);
// Rotas de atribuições de usuários a escolas
app.use("/api/escola-utilizadores", escolaUtilizadorRoutes);
// Rotas de alunos
app.use("/api/alunos", alunoRoutes);
// Rotas de categorias de carta
app.use("/api/categorias-carta", categoriaCartaRoutes);
// Rotas de matrículas
app.use("/api/matriculas", matriculaRoutes);
// Rotas de aulas
app.use("/api/aulas", aulaRoutes);
// Rotas de exames
app.use("/api/exames", exameRoutes);
// Rotas de parcelas
app.use("/api/parcelas", parcelaRoutes);
// Rotas de pagamentos
app.use("/api/pagamentos", pagamentoRoutes);
// Rotas de instrutores
app.use("/api/instrutores", instrutorRoutes);
// Rotas de veículos
app.use("/api/veiculos", veiculoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


