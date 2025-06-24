const EscolaUtilizador = require("../models/EscolaUtilizador");
const Escola = require("../models/Escola");
const User = require("../models/User");

// Listar todas as atribuições
exports.listarAtribuicoes = async (req, res) => {
    try {
        const atribuicoes = await EscolaUtilizador.getAllAtribuicoes();
        
        res.status(200).json({
            success: true,
            data: atribuicoes,
            total: atribuicoes.length
        });
    } catch (error) {
        console.error('Erro ao listar atribuições:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao listar atribuições"
        });
    }
};

// Atribuir usuário a uma escola
exports.atribuirUsuario = async (req, res) => {
    try {
        const { id_escola, id_utilizador } = req.body;

        // Validar dados
        if (!id_escola || !id_utilizador) {
            return res.status(400).json({
                success: false,
                message: "ID da escola e ID do usuário são obrigatórios"
            });
        }

        // Verificar se a escola existe
        const escola = await Escola.getById(id_escola);
        if (!escola) {
            return res.status(404).json({
                success: false,
                message: "Escola não encontrada"
            });
        }

        // Verificar se o usuário existe
        const usuario = await User.findById(id_utilizador);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        // Verificar se já está atribuído
        const jaAtribuido = await EscolaUtilizador.verificarAtribuicao(id_escola, id_utilizador);
        if (jaAtribuido) {
            return res.status(400).json({
                success: false,
                message: "Usuário já está atribuído a esta escola"
            });
        }

        // Fazer a atribuição
        await EscolaUtilizador.atribuirUsuario(id_escola, id_utilizador);

        res.status(201).json({
            success: true,
            message: "Usuário atribuído à escola com sucesso"
        });
    } catch (error) {
        console.error('Erro ao atribuir usuário:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao atribuir usuário"
        });
    }
};

// Remover atribuição de usuário
exports.removerAtribuicao = async (req, res) => {
    try {
        const { id_escola, id_utilizador } = req.params;

        // Verificar se a atribuição existe
        const jaAtribuido = await EscolaUtilizador.verificarAtribuicao(id_escola, id_utilizador);
        if (!jaAtribuido) {
            return res.status(404).json({
                success: false,
                message: "Atribuição não encontrada"
            });
        }

        // Remover atribuição
        await EscolaUtilizador.removerAtribuicao(id_escola, id_utilizador);

        res.status(200).json({
            success: true,
            message: "Atribuição removida com sucesso"
        });
    } catch (error) {
        console.error('Erro ao remover atribuição:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao remover atribuição"
        });
    }
};

// Obter usuários de uma escola
exports.getUtilizadoresByEscola = async (req, res) => {
    try {
        const { id_escola } = req.params;

        // Verificar se a escola existe
        const escola = await Escola.getById(id_escola);
        if (!escola) {
            return res.status(404).json({
                success: false,
                message: "Escola não encontrada"
            });
        }

        const utilizadores = await EscolaUtilizador.getUtilizadoresByEscola(id_escola);

        res.status(200).json({
            success: true,
            data: utilizadores,
            total: utilizadores.length
        });
    } catch (error) {
        console.error('Erro ao buscar usuários da escola:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar usuários da escola"
        });
    }
};

// Obter escolas de um usuário
exports.getEscolasByUtilizador = async (req, res) => {
    try {
        const { id_utilizador } = req.params;

        // Verificar se o usuário existe
        const usuario = await User.findById(id_utilizador);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        const escolas = await EscolaUtilizador.getEscolasByUtilizador(id_utilizador);

        res.status(200).json({
            success: true,
            data: escolas,
            total: escolas.length
        });
    } catch (error) {
        console.error('Erro ao buscar escolas do usuário:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar escolas do usuário"
        });
    }
};

// Obter usuários não atribuídos a uma escola
exports.getUtilizadoresNaoAtribuidos = async (req, res) => {
    try {
        const { id_escola } = req.params;

        // Verificar se a escola existe
        const escola = await Escola.getById(id_escola);
        if (!escola) {
            return res.status(404).json({
                success: false,
                message: "Escola não encontrada"
            });
        }

        const utilizadores = await EscolaUtilizador.getUtilizadoresNaoAtribuidos(id_escola);

        res.status(200).json({
            success: true,
            data: utilizadores,
            total: utilizadores.length
        });
    } catch (error) {
        console.error('Erro ao buscar usuários não atribuídos:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar usuários não atribuídos"
        });
    }
};

// Obter escolas não atribuídas a um usuário
exports.getEscolasNaoAtribuidas = async (req, res) => {
    try {
        const { id_utilizador } = req.params;

        // Verificar se o usuário existe
        const usuario = await User.findById(id_utilizador);
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        const escolas = await EscolaUtilizador.getEscolasNaoAtribuidas(id_utilizador);

        res.status(200).json({
            success: true,
            data: escolas,
            total: escolas.length
        });
    } catch (error) {
        console.error('Erro ao buscar escolas não atribuídas:', error);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor ao buscar escolas não atribuídas"
        });
    }
}; 