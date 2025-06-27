const Aluno = require("../models/Aluno");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const minioClient = require("../config/minio");
const XLSX = require("xlsx");

// Função para formatar data para o formato ISO (YYYY-MM-DD)
const formatDateForResponse = (date) => {
    if (!date) return null;
    
    // Se já é uma string no formato correto, retornar
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }
    
    // Se é um objeto Date do MySQL, converter para string
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    
    // Tentar criar uma data válida
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
        return newDate.toISOString().split('T')[0];
    }
    
    return null;
};

// Função para processar dados do aluno antes de retornar
const processAlunoData = (aluno) => {
    if (!aluno) return aluno;
    
    // Formatar data de nascimento
    if (aluno.data_nascimento) {
        aluno.data_nascimento = formatDateForResponse(aluno.data_nascimento);
    }
    
    return aluno;
};

// Validation function for student data
const validateAlunoData = (data, isUpdate = false) => {
    const errors = [];
    
    // Required fields (only for creation, not for updates)
    if (!isUpdate) {
        if (!data.id_escola) errors.push("id_escola é obrigatório");
        if (!data.numero_ficha) errors.push("numero_ficha é obrigatório");
        if (!data.nome_completo) errors.push("nome_completo é obrigatório");
        if (!data.telefone_principal) errors.push("telefone_principal é obrigatório");
    }
    
    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push("email deve ter um formato válido");
    }
    
    // Validate phone format if provided
    if (data.telefone_principal && !/^\+?[0-9\s\-\(\)]+$/.test(data.telefone_principal)) {
        errors.push("telefone_principal deve ter um formato válido");
    }
    
    if (data.telefone_alternativo && !/^\+?[0-9\s\-\(\)]+$/.test(data.telefone_alternativo)) {
        errors.push("telefone_alternativo deve ter um formato válido");
    }
    
    // Validate date format if provided
    if (data.data_nascimento && !/^\d{4}-\d{2}-\d{2}$/.test(data.data_nascimento)) {
        errors.push("data_nascimento deve estar no formato YYYY-MM-DD");
    }
    
    return errors;
};

exports.createAluno = async (req, res) => {
    try {
        // Validate input data
        const validationErrors = validateAlunoData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Dados inválidos", 
                errors: validationErrors 
            });
        }

        // Check if numero_ficha already exists
        const existingFicha = await Aluno.getByNumeroFicha(req.body.numero_ficha);
        if (existingFicha) {
            return res.status(409).json({ 
                message: "Número de ficha já existe no sistema" 
            });
        }

        // Check if numero_identificacao already exists
        const existingIdentificacao = await Aluno.getByNumeroIdentificacao(req.body.numero_identificacao);
        if (existingIdentificacao) {
            return res.status(409).json({ 
                message: "Número de identificação já existe no sistema" 
            });
        }

        // Check if email already exists (if provided)
        if (req.body.email) {
            const existingEmail = await Aluno.getByEmail(req.body.email);
            if (existingEmail) {
                return res.status(409).json({ 
                    message: "Email já existe no sistema" 
                });
            }
        }

        const alunoId = await Aluno.create(req.body);
        res.status(201).json({ 
            message: "Aluno criado com sucesso", 
            alunoId,
            aluno: await Aluno.getById(alunoId)
        });
    } catch (error) {
        console.error("Erro ao criar aluno:", error);
        
        // Handle specific database errors
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('numero_ficha')) {
                return res.status(409).json({ message: "Número de ficha já existe no sistema" });
            }
            if (error.message.includes('numero_identificacao')) {
                return res.status(409).json({ message: "Número de identificação já existe no sistema" });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: "Email já existe no sistema" });
            }
        }
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "Escola não encontrada" });
        }
        
        res.status(500).json({ 
            message: "Erro interno do servidor ao criar aluno",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAllAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.getAllWithFinanceiro();
        // Processar dados de todos os alunos
        const processedAlunos = alunos.map(processAlunoData);
        res.status(200).json(processedAlunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar alunos" });
    }
};

exports.getAlunosPorEscola = async (req, res) => {
    try {

        console.log(req.params)
        const { id_escola } = req.params;
        const alunos = await Aluno.getByEscolaId(id_escola);
        // Processar dados de todos os alunos
        const processedAlunos = alunos.map(processAlunoData);
        res.status(200).json(processedAlunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar alunos por escola" });
    }
};

// Listar alunos das escolas atribuídas ao usuário
exports.getAlunosEscolasAtribuidas = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userEscolas = req.user.escolas;

        // Se for Super Admin (role 1), pode ver alunos de todas as escolas
        if (userRole === 1) {
            const alunos = await Aluno.getAllWithFinanceiro();
            return res.status(200).json({
                success: true,
                message: "Alunos de todas as escolas (Super Admin)",
                total_alunos: alunos.length,
                alunos: alunos
            });
        }

        // Para outros roles, verificar se tem escolas atribuídas
        if (!userEscolas || userEscolas.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Você não tem escolas atribuídas para visualizar alunos"
            });
        }

        // Buscar alunos das escolas atribuídas
        const alunosEscolasAtribuidas = [];
        let totalAlunos = 0;

        for (const escolaId of userEscolas) {
            const alunosEscola = await Aluno.getByEscolaId(escolaId);
            // Processar dados dos alunos
            const processedAlunosEscola = alunosEscola.map(processAlunoData);
            alunosEscolasAtribuidas.push({
                id_escola: escolaId,
                alunos: processedAlunosEscola,
                total_alunos_escola: processedAlunosEscola.length
            });
            totalAlunos += processedAlunosEscola.length;
        }

        res.status(200).json({
            success: true,
            message: "Alunos das escolas atribuídas recuperados com sucesso",
            total_escolas: userEscolas.length,
            total_alunos: totalAlunos,
            escolas_alunos: alunosEscolasAtribuidas
        });

    } catch (error) {
        console.error('Erro ao buscar alunos das escolas atribuídas:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar alunos das escolas atribuídas"
        });
    }
};

exports.getAlunosComDividas = async (req, res) => {
    try {
        const alunos = await Aluno.getAlunosComDividas();
        // Processar dados de todos os alunos
        const processedAlunos = alunos.map(processAlunoData);
        res.status(200).json(processedAlunos);
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
        res.status(200).json(processAlunoData(aluno));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar aluno" });
    }
};

exports.updateAluno = async (req, res) => {
    try {
        console.log("Update aluno request:", {
            id: req.params.id,
            body: req.body
        });

        // Validate input data
        const validationErrors = validateAlunoData(req.body, true);
        if (validationErrors.length > 0) {
            console.log("Validation errors:", validationErrors);
            return res.status(400).json({ 
                message: "Dados inválidos", 
                errors: validationErrors 
            });
        }

        // Check if aluno exists
        const existingAluno = await Aluno.getById(req.params.id);
        if (!existingAluno) {
            console.log("Aluno not found:", req.params.id);
            return res.status(404).json({ 
                message: "Aluno não encontrado" 
            });
        }

        console.log("Existing aluno:", existingAluno);

        // Check if numero_ficha already exists (excluding current aluno)
        if (req.body.numero_ficha && req.body.numero_ficha !== existingAluno.numero_ficha) {
            const existingFicha = await Aluno.getByNumeroFicha(req.body.numero_ficha);
            if (existingFicha && existingFicha.id_aluno !== parseInt(req.params.id)) {
                return res.status(409).json({ 
                    message: "Número de ficha já existe no sistema" 
                });
            }
        }

        // Check if numero_identificacao already exists (excluding current aluno)
        if (req.body.numero_identificacao && req.body.numero_identificacao !== existingAluno.numero_identificacao) {
            const existingIdentificacao = await Aluno.getByNumeroIdentificacao(req.body.numero_identificacao);
            if (existingIdentificacao && existingIdentificacao.id_aluno !== parseInt(req.params.id)) {
                return res.status(409).json({ 
                    message: "Número de identificação já existe no sistema" 
                });
            }
        }

        // Check if email already exists (excluding current aluno)
        if (req.body.email && req.body.email !== existingAluno.email) {
            const existingEmail = await Aluno.getByEmail(req.body.email);
            if (existingEmail && existingEmail.id_aluno !== parseInt(req.params.id)) {
                return res.status(409).json({ 
                    message: "Email já existe no sistema" 
                });
            }
        }

        console.log("Updating aluno with data:", req.body);
        const affectedRows = await Aluno.update(req.params.id, req.body);
        console.log("Affected rows:", affectedRows);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        
        // Return updated aluno data
        const updatedAluno = await Aluno.getById(req.params.id);
        console.log("Updated aluno:", updatedAluno);
        
        res.status(200).json({ 
            message: "Aluno atualizado com sucesso",
            aluno: processAlunoData(updatedAluno)
        });
    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);
        console.error("Error stack:", error.stack);
        
        // Handle specific database errors
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('numero_ficha')) {
                return res.status(409).json({ message: "Número de ficha já existe no sistema" });
            }
            if (error.message.includes('numero_identificacao')) {
                return res.status(409).json({ message: "Número de identificação já existe no sistema" });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: "Email já existe no sistema" });
            }
        }
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "Escola não encontrada" });
        }
        
        res.status(500).json({ 
            message: "Erro interno do servidor ao atualizar aluno",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteAluno = async (req, res) => {
    try {
        // Check if aluno exists
        const existingAluno = await Aluno.getById(req.params.id);
        if (!existingAluno) {
            return res.status(404).json({ 
                message: "Aluno não encontrado" 
            });
        }

        // Check if aluno has active enrollments (matriculas)
        if (existingAluno.matriculas && existingAluno.matriculas.length > 0) {
            const activeMatriculas = existingAluno.matriculas.filter(
                matricula => matricula.status_matricula === 'Ativa' || matricula.status_matricula === 'Em andamento'
            );
            
            if (activeMatriculas.length > 0) {
                return res.status(400).json({ 
                    message: "Não é possível excluir um aluno com matrículas ativas. Desative as matrículas primeiro." 
                });
            }
        }

        const affectedRows = await Aluno.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }
        
        res.status(200).json({ 
            message: "Aluno deletado com sucesso",
            deletedAluno: {
                id_aluno: existingAluno.id_aluno,
                nome_completo: existingAluno.nome_completo,
                numero_ficha: existingAluno.numero_ficha
            }
        });
    } catch (error) {
        console.error("Erro ao deletar aluno:", error);
        
        // Handle foreign key constraint errors
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: "Não é possível excluir este aluno pois existem registros relacionados (matrículas, pagamentos, etc.)" 
            });
        }
        
        res.status(500).json({ 
            message: "Erro interno do servidor ao deletar aluno",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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


