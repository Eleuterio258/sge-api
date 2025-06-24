const Aula = require("../models/Aula");

exports.createAula = async (req, res) => {
    try {
        const aulaId = await Aula.create(req.body);
        res.status(201).json({ message: "Aula criada com sucesso", aulaId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar aula" });
    }
};

exports.getAllAulas = async (req, res) => {
    try {
        const aulas = await Aula.getAll();
        res.status(200).json(aulas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar aulas" });
    }
};

exports.getAulaById = async (req, res) => {
    try {
        const aula = await Aula.getById(req.params.id);
        if (!aula) {
            return res.status(404).json({ message: "Aula não encontrada" });
        }
        res.status(200).json(aula);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar aula" });
    }
};

exports.updateAula = async (req, res) => {
    try {
        const affectedRows = await Aula.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aula não encontrada" });
        }
        res.status(200).json({ message: "Aula atualizada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar aula" });
    }
};

exports.deleteAula = async (req, res) => {
    try {
        const affectedRows = await Aula.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Aula não encontrada" });
        }
        res.status(200).json({ message: "Aula deletada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar aula" });
    }
};

exports.getProximasAulas = async (req, res) => {
    try {
        const aulas = await Aula.getProximasAulas();
        res.status(200).json(aulas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar próximas aulas" });
    }
};


