const Escola = require("../models/Escola");

exports.createEscola = async (req, res) => {
    try {
        const escolaId = await Escola.create(req.body);
        res.status(201).json({ message: "Escola criada com sucesso", escolaId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar escola" });
    }
};

exports.getAllEscolas = async (req, res) => {
    try {
        const escolas = await Escola.getAll();
        res.status(200).json(escolas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar escolas" });
    }
};

exports.getEscolaById = async (req, res) => {
    try {
        const escola = await Escola.getById(req.params.id);
        if (!escola) {
            return res.status(404).json({ message: "Escola não encontrada" });
        }
        res.status(200).json(escola);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar escola" });
    }
};

exports.updateEscola = async (req, res) => {
    try {
        const affectedRows = await Escola.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Escola não encontrada" });
        }
        res.status(200).json({ message: "Escola atualizada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar escola" });
    }
};

exports.deleteEscola = async (req, res) => {
    try {
        const affectedRows = await Escola.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Escola não encontrada" });
        }
        res.status(200).json({ message: "Escola deletada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar escola" });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { id_escola } = req.params;
        const stats = await Escola.getDashboardStats(id_escola);
        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar estatísticas da escola" });
    }
};

exports.getDashboardStatsGeral = async (req, res) => {
    try {
        const stats = await Escola.getDashboardStatsGeral();
        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar estatísticas gerais" });
    }
};

exports.getAtividadesRecentes = async (req, res) => {
    try {
        const atividades = await Escola.getAtividadesRecentes();
        res.status(200).json(atividades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar atividades recentes" });
    }
};

exports.getConquistasMes = async (req, res) => {
    try {
        const conquistas = await Escola.getConquistasMes();
        res.status(200).json(conquistas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar conquistas do mês" });
    }
};

exports.getPendencias = async (req, res) => {
    try {
        const pendencias = await Escola.getPendencias();
        res.status(200).json(pendencias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar pendências" });
    }
};


