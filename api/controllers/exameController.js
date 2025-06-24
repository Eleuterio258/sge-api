const Exame = require("../models/Exame");

exports.createExame = async (req, res) => {
    try {
        const exameId = await Exame.create(req.body);
        res.status(201).json({ message: "Exame criado com sucesso", exameId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar exame" });
    }
};

exports.getAllExames = async (req, res) => {
    try {
        const exames = await Exame.getAll();
        res.status(200).json(exames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar exames" });
    }
};

exports.getExameById = async (req, res) => {
    try {
        const exame = await Exame.getById(req.params.id);
        if (!exame) {
            return res.status(404).json({ message: "Exame não encontrado" });
        }
        res.status(200).json(exame);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar exame" });
    }
};

exports.updateExame = async (req, res) => {
    try {
        const affectedRows = await Exame.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Exame não encontrado" });
        }
        res.status(200).json({ message: "Exame atualizado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar exame" });
    }
};

exports.deleteExame = async (req, res) => {
    try {
        const affectedRows = await Exame.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Exame não encontrado" });
        }
        res.status(200).json({ message: "Exame deletado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar exame" });
    }
};


