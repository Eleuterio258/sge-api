/**
 * Utilitários para respostas padronizadas da API
 */

// Resposta de sucesso
const successResponse = (res, data, message = 'Operação realizada com sucesso', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

// Resposta de erro
const errorResponse = (res, message = 'Erro interno do servidor', statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }

    return res.status(statusCode).json(response);
};

// Resposta de validação
const validationResponse = (res, errors, message = 'Dados inválidos') => {
    return res.status(400).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    });
};

// Resposta de não encontrado
const notFoundResponse = (res, resource = 'Recurso') => {
    return res.status(404).json({
        success: false,
        message: `${resource} não encontrado`,
        timestamp: new Date().toISOString()
    });
};

// Resposta de acesso negado
const forbiddenResponse = (res, message = 'Acesso negado') => {
    return res.status(403).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

// Resposta de não autorizado
const unauthorizedResponse = (res, message = 'Não autorizado') => {
    return res.status(401).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

// Resposta de conflito
const conflictResponse = (res, message = 'Conflito de dados') => {
    return res.status(409).json({
        success: false,
        message,
        timestamp: new Date().toISOString()
    });
};

// Resposta paginada
const paginatedResponse = (res, data, page, limit, total, message = 'Dados recuperados com sucesso') => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        },
        timestamp: new Date().toISOString()
    });
};

// Resposta de criação
const createdResponse = (res, data, message = 'Recurso criado com sucesso') => {
    return successResponse(res, data, message, 201);
};

// Resposta de atualização
const updatedResponse = (res, data, message = 'Recurso atualizado com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de exclusão
const deletedResponse = (res, message = 'Recurso excluído com sucesso') => {
    return res.status(200).json({
        success: true,
        message,
        timestamp: new Date().toISOString()
    });
};

// Resposta de lista
const listResponse = (res, data, message = 'Lista recuperada com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de detalhes
const detailResponse = (res, data, message = 'Detalhes recuperados com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de login
const loginResponse = (res, data, message = 'Login realizado com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de logout
const logoutResponse = (res, message = 'Logout realizado com sucesso') => {
    return successResponse(res, null, message, 200);
};

// Resposta de refresh token
const refreshResponse = (res, data, message = 'Token renovado com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de upload
const uploadResponse = (res, data, message = 'Arquivo enviado com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de download
const downloadResponse = (res, data, message = 'Arquivo disponível para download') => {
    return successResponse(res, data, message, 200);
};

// Resposta de relatório
const reportResponse = (res, data, message = 'Relatório gerado com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de estatísticas
const statsResponse = (res, data, message = 'Estatísticas recuperadas com sucesso') => {
    return successResponse(res, data, message, 200);
};

// Resposta de dashboard
const dashboardResponse = (res, data, message = 'Dados do dashboard recuperados com sucesso') => {
    return successResponse(res, data, message, 200);
};

module.exports = {
    successResponse,
    errorResponse,
    validationResponse,
    notFoundResponse,
    forbiddenResponse,
    unauthorizedResponse,
    conflictResponse,
    paginatedResponse,
    createdResponse,
    updatedResponse,
    deletedResponse,
    listResponse,
    detailResponse,
    loginResponse,
    logoutResponse,
    refreshResponse,
    uploadResponse,
    downloadResponse,
    reportResponse,
    statsResponse,
    dashboardResponse
}; 