const Parcela = require("../models/Parcela");

exports.createParcela = async (req, res) => {
    try {
        const parcelaId = await Parcela.create(req.body);
        res.status(201).json({ message: "Parcela criada com sucesso", parcelaId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar parcela" });
    }
};

exports.getAllParcelas = async (req, res) => {
    try {
        const parcelas = await Parcela.getAll();
        res.status(200).json(parcelas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar parcelas" });
    }
};

exports.getParcelaById = async (req, res) => {
    try {
        const parcela = await Parcela.getById(req.params.id);
        if (!parcela) {
            return res.status(404).json({ message: "Parcela não encontrada" });
        }
        res.status(200).json(parcela);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar parcela" });
    }
};

exports.updateParcela = async (req, res) => {
    try {
        const affectedRows = await Parcela.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Parcela não encontrada" });
        }
        res.status(200).json({ message: "Parcela atualizada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar parcela" });
    }
};

exports.deleteParcela = async (req, res) => {
    try {
        const affectedRows = await Parcela.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Parcela não encontrada" });
        }
        res.status(200).json({ message: "Parcela deletada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar parcela" });
    }
};

exports.getParcelasByMatriculaId = async (req, res) => {
    try {
        const parcelas = await Parcela.getByMatriculaId(req.params.matriculaId);
        res.status(200).json(parcelas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar parcelas por matrícula" });
    }
};


