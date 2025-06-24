const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EscolaUtilizador = require("../models/EscolaUtilizador");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403);
        
        const fullUser = await User.findByIdWithTipo(user.id);
        if (!fullUser) return res.sendStatus(403);
        
        // Buscar escolas do utilizador
        const escolas = await EscolaUtilizador.getEscolasByUtilizador(user.id);
        
        req.user = {
            id: fullUser.id_utilizador,
            role: fullUser.id_tipo_utilizador,
            email: fullUser.email,
            nome: fullUser.nome_completo,
            escolas: escolas.map(e => e.id_escola)
        };
        next();
    });
}

function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acesso negado: Você não tem permissão para esta ação." });
        }
        next();
    };
}

// Verificar se utilizador tem acesso à escola
function authorizeSchool(req, res, next) {
    // Super Admin (1) e Admin Escola (2) têm acesso a todas as escolas
    if (req.user.role === 1 || req.user.role === 2) {
        return next();
    }
    
    const escola_id = req.params.id_escola || req.body.id_escola || req.query.id_escola;
    
    if (escola_id && !req.user.escolas.includes(parseInt(escola_id))) {
        return res.status(403).json({ 
            message: "Acesso negado: Você não tem permissão para acessar dados desta escola." 
        });
    }
    
    next();
}

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeSchool
};