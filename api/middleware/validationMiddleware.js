/**
 * Middleware para validação de dados de entrada
 */

// Validação de email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validação de telefone (formato moçambicano)
function validatePhone(phone) {
    const phoneRegex = /^(\+258|258)?[8][1-9][0-9]{7}$/;
    return phoneRegex.test(phone);
}

// Validação de NUIT (formato moçambicano)
function validateNUIT(nuit) {
    const nuitRegex = /^\d{9}$/;
    return nuitRegex.test(nuit);
}

// Validação de número de identificação
function validateIdentificationNumber(number) {
    return number && number.length >= 5 && number.length <= 50;
}

// Validação de data
function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Validação de valor monetário
function validateMoney(value) {
    return !isNaN(value) && parseFloat(value) >= 0;
}

// Middleware para validar dados de usuário
function validateUserData(req, res, next) {
    const { nome_completo, email, senha, telefone, id_tipo_utilizador } = req.body;
    const errors = [];

    if (!nome_completo || nome_completo.trim().length < 3) {
        errors.push("Nome completo deve ter pelo menos 3 caracteres");
    }

    if (!email || !validateEmail(email)) {
        errors.push("Email inválido");
    }

    if (!senha || senha.length < 6) {
        errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (telefone && !validatePhone(telefone)) {
        errors.push("Telefone inválido (formato: +258841234567)");
    }

    if (!id_tipo_utilizador || ![1, 2, 3, 5, 6].includes(parseInt(id_tipo_utilizador))) {
        errors.push("Tipo de utilizador inválido");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: errors
        });
    }

    next();
}

// Middleware para validar dados de escola
function validateSchoolData(req, res, next) {
    const { nome_escola, endereco, distrito, provincia, telefone, email, nuit } = req.body;
    const errors = [];

    if (!nome_escola || nome_escola.trim().length < 3) {
        errors.push("Nome da escola deve ter pelo menos 3 caracteres");
    }

    if (!endereco || endereco.trim().length < 5) {
        errors.push("Endereço deve ter pelo menos 5 caracteres");
    }

    if (!distrito || distrito.trim().length < 2) {
        errors.push("Distrito deve ter pelo menos 2 caracteres");
    }

    if (!provincia || provincia.trim().length < 2) {
        errors.push("Província deve ter pelo menos 2 caracteres");
    }

    if (telefone && !validatePhone(telefone)) {
        errors.push("Telefone inválido (formato: +258841234567)");
    }

    if (email && !validateEmail(email)) {
        errors.push("Email inválido");
    }

    if (nuit && !validateNUIT(nuit)) {
        errors.push("NUIT inválido (deve ter 9 dígitos)");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: errors
        });
    }

    next();
}

// Middleware para validar dados de aluno
function validateStudentData(req, res, next) {
    const { nome_completo, data_nascimento, numero_identificacao, tipo_identificacao, id_escola } = req.body;
    const errors = [];

    if (!nome_completo || nome_completo.trim().length < 3) {
        errors.push("Nome completo deve ter pelo menos 3 caracteres");
    }

    if (!data_nascimento || !validateDate(data_nascimento)) {
        errors.push("Data de nascimento inválida");
    }

    if (!numero_identificacao || !validateIdentificationNumber(numero_identificacao)) {
        errors.push("Número de identificação inválido");
    }

    if (!tipo_identificacao || !['BI', 'Passaporte', 'Cédula', 'Outro'].includes(tipo_identificacao)) {
        errors.push("Tipo de identificação inválido");
    }

    if (!id_escola || isNaN(parseInt(id_escola))) {
        errors.push("ID da escola inválido");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: errors
        });
    }

    next();
}

// Middleware para validar dados de matrícula
function validateEnrollmentData(req, res, next) {
    const { id_aluno, id_escola, id_categoria_carta, custo_total_curso } = req.body;
    const errors = [];

    if (!id_aluno || isNaN(parseInt(id_aluno))) {
        errors.push("ID do aluno inválido");
    }

    if (!id_escola || isNaN(parseInt(id_escola))) {
        errors.push("ID da escola inválido");
    }

    if (!id_categoria_carta || isNaN(parseInt(id_categoria_carta))) {
        errors.push("ID da categoria de carta inválido");
    }

    if (!custo_total_curso || !validateMoney(custo_total_curso)) {
        errors.push("Custo total do curso inválido");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: errors
        });
    }

    next();
}

// Middleware para validar dados de pagamento
function validatePaymentData(req, res, next) {
    const { id_matricula, valor_pago, metodo_pagamento } = req.body;
    const errors = [];

    if (!id_matricula || isNaN(parseInt(id_matricula))) {
        errors.push("ID da matrícula inválido");
    }

    if (!valor_pago || !validateMoney(valor_pago)) {
        errors.push("Valor pago inválido");
    }

    if (metodo_pagamento && !['Dinheiro', 'Cartão', 'Transferência', 'M-Pesa', 'Outro'].includes(metodo_pagamento)) {
        errors.push("Método de pagamento inválido");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: errors
        });
    }

    next();
}

// Middleware para validar ID numérico
function validateNumericId(req, res, next) {
    const id = req.params.id;
    
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
            message: "ID inválido",
            error: "INVALID_ID"
        });
    }
    
    req.params.id = parseInt(id);
    next();
}

// Middleware para validar paginação
function validatePagination(req, res, next) {
    const { page = 1, limit = 10 } = req.query;
    const errors = [];

    if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
        errors.push("Página deve ser um número maior que 0");
    }

    if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push("Limite deve ser um número entre 1 e 100");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Parâmetros de paginação inválidos",
            errors: errors
        });
    }

    req.query.page = parseInt(page);
    req.query.limit = parseInt(limit);
    next();
}

module.exports = {
    validateEmail,
    validatePhone,
    validateNUIT,
    validateIdentificationNumber,
    validateDate,
    validateMoney,
    validateUserData,
    validateSchoolData,
    validateStudentData,
    validateEnrollmentData,
    validatePaymentData,
    validateNumericId,
    validatePagination
}; 