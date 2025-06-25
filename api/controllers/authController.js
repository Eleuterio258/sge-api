const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const EscolaUtilizador = require("../models/EscolaUtilizador");
const Escola = require("../models/Escola");

// Helper function to generate access token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id_utilizador,
            role: user.id_tipo_utilizador,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "360d" }
    );
};

// Registro de utilizador
exports.register = async (req, res) => {
    const { nome_completo, email, senha, telefone, id_tipo_utilizador } = req.body;
    try {
        // Verificar se o email já existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email já está em uso" });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const userId = await User.create({
            nome_completo,
            email,
            senha_hash: hashedPassword,
            telefone,
            id_tipo_utilizador,
        });
        
        res.status(201).json({ 
            message: "Usuário registrado com sucesso", 
            userId,
            email: email
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: "Erro ao registrar usuário" });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await User.findByEmailWithTipo(email);
        if (!user) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        if (!user.senha_hash) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        const isMatch = await bcrypt.compare(senha, user.senha_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        if (!user.ativo) {
            return res.status(400).json({ message: "Conta desativada" });
        }

        // Buscar escolas do utilizador
        const escolas = await EscolaUtilizador.getEscolasByUtilizador(user.id_utilizador);

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshTokenData = await RefreshToken.create(user.id_utilizador);

        const { senha_hash, ...userInfo } = user;

        res.status(200).json({
            accessToken,
            refreshToken: refreshTokenData.token,
            user: {
                ...userInfo,
                escolas_atribuidas: escolas
            },
            expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: "Erro ao fazer login" });
    }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token é obrigatório" });
    }

    try {
        // Find refresh token in database
        const tokenData = await RefreshToken.findByToken(refreshToken);

        if (!tokenData) {
            return res.status(403).json({ message: "Refresh token inválido ou expirado" });
        }

        // Get user data
        const user = await User.findByIdWithTipo(tokenData.id_utilizador);

        if (!user || !user.ativo) {
            return res.status(403).json({ message: "Usuário não encontrado ou inativo" });
        }

        // Buscar escolas do utilizador
        const escolas = await EscolaUtilizador.getEscolasByUtilizador(user.id_utilizador);

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Optionally generate new refresh token (rotate refresh tokens)
        const newRefreshTokenData = await RefreshToken.create(user.id_utilizador);

        // Revoke old refresh token
        await RefreshToken.revokeToken(refreshToken);

        const { senha_hash, ...userInfo } = user;

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshTokenData.token,
            user: {
                ...userInfo,
                escolas_atribuidas: escolas
            },
            expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        });

    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ message: "Erro ao renovar token" });
    }
};

// Logout
exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        if (refreshToken) {
            await RefreshToken.revokeToken(refreshToken);
        }

        res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Erro ao fazer logout" });
    }
};

// Logout de todos os dispositivos
exports.logoutAll = async (req, res) => {
    try {
        const userId = req.user.id;
        await RefreshToken.revokeAllUserTokens(userId);

        res.status(200).json({ message: "Logout de todos os dispositivos realizado com sucesso" });
    } catch (error) {
        console.error("Logout all error:", error);
        res.status(500).json({ message: "Erro ao fazer logout de todos os dispositivos" });
    }
};

// Obter dados do utilizador atual
exports.me = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByIdWithTipo(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        // Buscar escolas do utilizador
        const escolas = await EscolaUtilizador.getEscolasByUtilizador(userId);

        const { senha_hash, ...userInfo } = user;
        res.status(200).json({ 
            user: {
                ...userInfo,
                escolas_atribuidas: escolas
            }
        });
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ message: "Erro ao buscar dados do usuário" });
    }
};

// Listar todos os utilizadores
exports.allUsers = async (req, res) => { 
    try {
        const users = await User.findAllWithTipo();
        
        // Remover senha_hash de todos os usuários
        const usersWithoutPassword = users.map(user => {
            const { senha_hash, ...userInfo } = user;
            return userInfo;
        });

        res.status(200).json({
            success: true,
            data: usersWithoutPassword,
            total: usersWithoutPassword.length
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro interno do servidor ao listar usuários" 
        });
    }
};

// ========== GESTÃO DE ESCOLAS-UTILIZADORES ==========

// Atribuir utilizador a escola
exports.atribuirEscola = async (req, res) => {
    try {
        const { id_utilizador, id_escola } = req.body;

        if (!id_utilizador || !id_escola) {
            return res.status(400).json({ 
                message: "Campos obrigatórios: id_utilizador, id_escola" 
            });
        }

        // Verificar se o utilizador existe
        const user = await User.findById(id_utilizador);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado" });
        }

        // Verificar se a escola existe
        const escola = await Escola.getById(id_escola);
        if (!escola) {
            return res.status(404).json({ message: "Escola não encontrada" });
        }

        // Criar atribuição
        const atribuicaoId = await EscolaUtilizador.create({
            id_escola: parseInt(id_escola),
            id_utilizador: parseInt(id_utilizador)
        });

        res.status(201).json({ 
            message: "Utilizador atribuído à escola com sucesso",
            atribuicao_id: atribuicaoId,
            utilizador: user.nome_completo,
            escola: escola.nome_escola,
            data_atribuicao: new Date()
        });

    } catch (error) {
        console.error('Erro ao atribuir escola:', error);
        if (error.message === "Utilizador já está atribuído a esta escola") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro ao atribuir escola" });
    }
};

// Remover utilizador de escola
exports.removerEscola = async (req, res) => {
    try {
        const { id_utilizador, id_escola } = req.body;

        if (!id_utilizador || !id_escola) {
            return res.status(400).json({ 
                message: "Campos obrigatórios: id_utilizador, id_escola" 
            });
        }

        // Buscar dados para confirmação
        const user = await User.findById(id_utilizador);
        const escola = await Escola.getById(id_escola);

        const affectedRows = await EscolaUtilizador.deactivate(id_escola, id_utilizador);
        
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Atribuição não encontrada ou já removida" });
        }

        res.status(200).json({ 
            message: "Utilizador removido da escola com sucesso",
            utilizador: user ? user.nome_completo : 'Não encontrado',
            escola: escola ? escola.nome_escola : 'Não encontrada'
        });

    } catch (error) {
        console.error('Erro ao remover escola:', error);
        res.status(500).json({ message: "Erro ao remover escola" });
    }
};

// Listar utilizadores de uma escola
exports.utilizadoresPorEscola = async (req, res) => {
    try {
        const { id_escola } = req.params;

        // Verificar se a escola existe
        const escola = await Escola.getById(id_escola);
        if (!escola) {
            return res.status(404).json({ message: "Escola não encontrada" });
        }

        const utilizadores = await EscolaUtilizador.getUtilizadoresByEscola(id_escola);
        
        // Remove senhas dos dados retornados
        const utilizadoresSemSenha = utilizadores.map(user => {
            const { senha_hash, ...userInfo } = user;
            return userInfo;
        });

        res.status(200).json({
            success: true,
            escola: {
                id_escola: parseInt(id_escola),
                nome_escola: escola.nome_escola
            },
            total_utilizadores: utilizadoresSemSenha.length,
            utilizadores: utilizadoresSemSenha
        });

    } catch (error) {
        console.error('Erro ao listar utilizadores por escola:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao listar utilizadores por escola" 
        });
    }
};

// Listar escolas de um utilizador
exports.escolasPorUtilizador = async (req, res) => {
    try {
        const { id_utilizador } = req.params;

        // Verificar se o utilizador existe
        const user = await User.findById(id_utilizador);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado" });
        }

        const escolas = await EscolaUtilizador.getEscolasByUtilizador(id_utilizador);

        res.status(200).json({
            success: true,
            utilizador: {
                id_utilizador: parseInt(id_utilizador),
                nome_completo: user.nome_completo,
                email: user.email
            },
            total_escolas: escolas.length,
            escolas: escolas
        });

    } catch (error) {
        console.error('Erro ao listar escolas por utilizador:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao listar escolas por utilizador" 
        });
    }
};

// Listar todas as atribuições
exports.todasAtribuicoes = async (req, res) => {
    try {
        const atribuicoes = await EscolaUtilizador.getAll();
        
        res.status(200).json({
            success: true,
            total_atribuicoes: atribuicoes.length,
            atribuicoes: atribuicoes
        });

    } catch (error) {
        console.error('Erro ao listar atribuições:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao listar atribuições" 
        });
    }
};

// Estatísticas de atribuições
exports.estatisticasAtribuicoes = async (req, res) => {
    try {
        const stats = await EscolaUtilizador.getStats();
        
        // Adicionar mais estatísticas
        const totalEscolas = await Escola.getAll();
        const totalUtilizadores = await User.getAll();
        
        const estatisticasCompletas = {
            ...stats,
            total_escolas: totalEscolas.length,
            total_utilizadores: totalUtilizadores.length,
            utilizadores_sem_escola: totalUtilizadores.length - stats.total_atribuicoes,
            media_utilizadores_por_escola: totalEscolas.length > 0 ? 
                (stats.total_atribuicoes / totalEscolas.length).toFixed(2) : 0
        };
        
        res.status(200).json({
            success: true,
            estatisticas: estatisticasCompletas
        });

    } catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao gerar estatísticas" 
        });
    }
};

// Verificar acesso de utilizador a escola
exports.verificarAcesso = async (req, res) => {
    try {
        const { id_utilizador, id_escola } = req.params;

        const temAcesso = await EscolaUtilizador.hasAccessToEscola(id_utilizador, id_escola);
        
        res.status(200).json({
            success: true,
            tem_acesso: temAcesso,
            id_utilizador: parseInt(id_utilizador),
            id_escola: parseInt(id_escola)
        });

    } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        res.status(500).json({ 
            success: false,
            message: "Erro ao verificar acesso" 
        });
    }
};

// Atualizar utilizador
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { nome_completo, email, telefone, id_tipo_utilizador, senha } = req.body;

        // Verificar se o usuário existe
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        // Preparar dados para atualização
        const updateData = {
            nome_completo,
            email,
            telefone,
            id_tipo_utilizador
        };

        // Se uma nova senha foi fornecida, hash dela
        if (senha && senha.trim() !== '') {
            const hashedPassword = await bcrypt.hash(senha, 10);
            updateData.senha_hash = hashedPassword;
        }

        // Atualizar usuário
        const result = await User.update(userId, updateData);

        if (result > 0) {
            res.status(200).json({
                success: true,
                message: "Usuário atualizado com sucesso"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Nenhuma alteração foi feita"
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao atualizar usuário"
        });
    }
};

// Alterar senha
exports.changePassword = async (req, res) => {
    try {
        const { id_utilizador, senha_atual, senha_nova } = req.body;

        if (!id_utilizador || !senha_atual || !senha_nova) {
            return res.status(400).json({ 
                message: "Campos obrigatórios: id_utilizador, senha_atual, senha_nova" 
            });
        }

        // Verificar se o utilizador existe
        const user = await User.findById(id_utilizador);
        if (!user) {
            return res.status(404).json({ message: "Utilizador não encontrado" });
        }

        // Verificar senha atual
        const isMatch = await bcrypt.compare(senha_atual, user.senha_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Senha atual incorreta" });
        }

        // Hash da nova senha
        const hashedNewPassword = await bcrypt.hash(senha_nova, 10);

        // Atualizar senha
        const userData = {
            ...user,
            senha_hash: hashedNewPassword
        };

        const affectedRows = await User.update(id_utilizador, userData);
        
        if (affectedRows === 0) {
            return res.status(500).json({ message: "Erro ao alterar senha" });
        }

        // Revogar todos os tokens do utilizador
        await RefreshToken.revokeAllUserTokens(id_utilizador);

        res.status(200).json({ 
            message: "Senha alterada com sucesso. Faça login novamente.",
            logout_required: true
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: "Erro ao alterar senha" });
    }
};

// Excluir usuário
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Verificar se o usuário existe
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        // Verificar se não está tentando excluir o próprio usuário logado
        if (req.user && req.user.id === parseInt(userId)) {
            return res.status(400).json({
                success: false,
                message: "Não é possível excluir o próprio usuário"
            });
        }

        // Excluir usuário
        const result = await User.delete(userId);

        if (result > 0) {
            res.status(200).json({
                success: true,
                message: "Usuário excluído com sucesso"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Erro ao excluir usuário"
            });
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao excluir usuário"
        });
    }
};