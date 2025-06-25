const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EscolaUtilizador = require("../models/EscolaUtilizador");

/**
 * Middleware para autenticar token JWT
 */
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ 
                message: "Token de acesso não fornecido",
                error: "AUTH_TOKEN_MISSING"
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.error('Erro na verificação do token:', err.message);
                
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        message: "Token expirado",
                        error: "TOKEN_EXPIRED"
                    });
                }
                
                return res.status(401).json({ 
                    message: "Token inválido",
                    error: "TOKEN_INVALID"
                });
            }
            
            try {
                const fullUser = await User.findByIdWithTipo(decoded.id);
                if (!fullUser) {
                    return res.status(401).json({ 
                        message: "Usuário não encontrado",
                        error: "USER_NOT_FOUND"
                    });
                }
                
                if (!fullUser.ativo) {
                    return res.status(401).json({ 
                        message: "Usuário inativo",
                        error: "USER_INACTIVE"
                    });
                }
                
                const escolas = await EscolaUtilizador.getEscolasByUtilizador(decoded.id);
                
                req.user = {
                    id: fullUser.id_utilizador,
                    role: fullUser.id_tipo_utilizador,
                    email: fullUser.email,
                    nome: fullUser.nome_completo,
                    escolas: escolas.map(e => e.id_escola),
                    nome_tipo_utilizador: fullUser.nome_tipo_utilizador
                };
                
                next();
            } catch (dbError) {
                console.error('Erro ao buscar usuário:', dbError);
                return res.status(500).json({ 
                    message: "Erro interno do servidor",
                    error: "DATABASE_ERROR"
                });
            }
        });
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ 
            message: "Erro interno do servidor",
            error: "AUTH_MIDDLEWARE_ERROR"
        });
    }
}

/**
 * Middleware para autorizar roles específicos
 */
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: "Usuário não autenticado",
                error: "USER_NOT_AUTHENTICATED"
            });
        }
        
        if (!req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Acesso negado: Você não tem permissão para esta ação.",
                error: "INSUFFICIENT_PERMISSIONS",
                requiredRoles: roles,
                userRole: req.user.role
            });
        }
        
        next();
    };
}

/**
 * Middleware para verificar acesso à escola
 */
function authorizeSchool(req, res, next) {
    try {
        if (req.user.role === 1) {
            return next();
        }
        
        const escola_id = req.params.id_escola || req.body.id_escola || req.query.id_escola;
        
        if (!escola_id) {
            return res.status(400).json({ 
                message: "ID da escola não fornecido",
                error: "SCHOOL_ID_MISSING"
            });
        }
        
        const escolaId = parseInt(escola_id);
        
        if (isNaN(escolaId)) {
            return res.status(400).json({ 
                message: "ID da escola inválido",
                error: "INVALID_SCHOOL_ID"
            });
        }
        
        if (!req.user.escolas.includes(escolaId)) {
            return res.status(403).json({ 
                message: "Acesso negado: Você não tem permissão para acessar dados desta escola.",
                error: "SCHOOL_ACCESS_DENIED"
            });
        }
        
        next();
    } catch (error) {
        console.error('Erro no middleware de autorização de escola:', error);
        return res.status(500).json({ 
            message: "Erro interno do servidor",
            error: "SCHOOL_AUTH_ERROR"
        });
    }
}

/**
 * Middleware para verificar se o usuário é dono do recurso ou tem permissão
 */
function authorizeResourceOwner(resourceModel, resourceIdField = 'id') {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdField];
            
            if (!resourceId) {
                return res.status(400).json({ 
                    message: "ID do recurso não fornecido",
                    error: "RESOURCE_ID_MISSING"
                });
            }
            
            // Super Admin pode acessar qualquer recurso
            if (req.user.role === 1) {
                return next();
            }
            
            // Buscar o recurso para verificar o proprietário
            const resource = await resourceModel.findById(resourceId);
            
            if (!resource) {
                return res.status(404).json({ 
                    message: "Recurso não encontrado",
                    error: "RESOURCE_NOT_FOUND"
                });
            }
            
            // Verificar se o usuário tem acesso à escola do recurso
            if (resource.id_escola && !req.user.escolas.includes(resource.id_escola)) {
                return res.status(403).json({ 
                    message: "Acesso negado: Você não tem permissão para este recurso.",
                    error: "RESOURCE_ACCESS_DENIED"
                });
            }
            
            next();
        } catch (error) {
            console.error('Erro no middleware de autorização de recurso:', error);
            return res.status(500).json({ 
                message: "Erro interno do servidor",
                error: "RESOURCE_AUTH_ERROR"
            });
        }
    };
}

/**
 * Middleware para logging de requisições autenticadas
 */
function logAuthenticatedRequest(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?.id} (${req.user?.role})`);
    next();
}

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeSchool,
    authorizeResourceOwner,
    logAuthenticatedRequest
}; 