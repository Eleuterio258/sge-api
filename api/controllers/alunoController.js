const Aluno = require("../models/Aluno");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const minioClient = require("../config/minio");
const XLSX = require("xlsx");

exports.createAluno = async (req, res) => {
    try {
        const alunoId = await Aluno.create(req.body);
        res.status(201).json({ message: "Aluno criado com sucesso", alunoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar aluno" });
    }
};

exports.getAllAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.getAllWithFinanceiro();
        res.status(200).json(alunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar alunos" });
    }
};

exports.getAlunosPorEscola = async (req, res) => {
    try {
        const { id_escola } = req.params;
        const alunos = await Aluno.getByEscolaId(id_escola);
        res.status(200).json(alunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar alunos por escola" });
    }
};

exports.getAlunosComDividas = async (req, res) => {
    try {
        const alunos = await Aluno.getAlunosComDividas();
        res.status(200).json(alunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar alunos com dívidas" });
    }
};

exports.getAlunoById = async (req, res) => {
    try {
        const aluno = await Aluno.getById(req.params.id);
        if (!aluno) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar aluno" });
    }
};

exports.updateAluno = async (req, res) => {
    try {
        const affectedRows = await Aluno.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        res.status(200).json({ message: "Aluno atualizado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar aluno" });
    }
};

exports.deleteAluno = async (req, res) => {
    try {
        const affectedRows = await Aluno.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        res.status(200).json({ message: "Aluno deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar aluno" });
    }
};

exports.importarAlunos = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Arquivo não enviado" });
    }
    const filePath = path.resolve(req.file.path);
    const ext = path.extname(req.file.originalname).toLowerCase();
    let alunos = [];
    try {
        if (ext === ".csv") {
            // Ler CSV
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on("data", (row) => alunos.push(row))
                    .on("end", resolve)
                    .on("error", reject);
            });
        } else if (ext === ".xlsx" || ext === ".xls") {
            // Ler Excel
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            alunos = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
            return res.status(400).json({ message: "Formato de arquivo não suportado" });
        }
        // Inserir alunos
        let inseridos = 0, erros = [];
        for (const aluno of alunos) {
            try {
                await Aluno.create(aluno);
                inseridos++;
            } catch (e) {
                erros.push({ aluno, erro: e.message });
            }
        }
        fs.unlinkSync(filePath); // Remove arquivo após uso
        res.status(200).json({ inseridos, erros });
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error(error);
        res.status(500).json({ message: "Erro ao importar alunos" });
    }
};

exports.exportarAlunosExcel = async (req, res) => {
    try {
        const alunos = await Aluno.getAllWithFinanceiro();
        // Montar dados para Excel (apenas um exemplo simples, pode ser expandido)
        const data = [];
        for (const aluno of alunos) {
            for (const matricula of aluno.matriculas) {
                for (const parcela of matricula.parcelas) {
                    data.push({
                        id_aluno: aluno.id_aluno,
                        nome_completo: aluno.nome_completo,
                        email: aluno.email,
                        id_matricula: matricula.id_matricula,
                        custo_total_curso: matricula.custo_total_curso,
                        status_matricula: matricula.status_matricula,
                        numero_parcela: parcela.numero_parcela,
                        valor_devido: parcela.valor_devido,
                        data_vencimento: parcela.data_vencimento,
                        status_parcela: parcela.status_parcela
                    });
                }
            }
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "alunos");
        const filePath = `alunos_export_${Date.now()}.xlsx`;
        XLSX.writeFile(wb, filePath);
        // Upload para MinIO
        const bucket = process.env.MINIO_BUCKET || "relatorios";
        // Garante que o bucket existe
        try { await minioClient.makeBucket(bucket); } catch (e) {}
        const minioFileName = `alunos/${filePath}`;
        await minioClient.fPutObject(bucket, minioFileName, filePath);
        // Gerar URL pública (presigned)
        const url = await minioClient.presignedUrl('GET', bucket, minioFileName, 24*60*60);
        fs.unlinkSync(filePath); // Remove arquivo local
        res.status(200).json({ url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao exportar alunos para Excel" });
    }
};


