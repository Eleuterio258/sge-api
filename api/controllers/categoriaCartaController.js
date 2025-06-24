const CategoriaCarta = require("../models/CategoriaCarta");

exports.createCategoriaCarta = async (req, res) => {
    try {
        const categoriaId = await CategoriaCarta.create(req.body);
        res.status(201).json({ message: "Categoria de Carta criada com sucesso", categoriaId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar categoria de carta" });
    }
};

exports.getAllCategoriasCarta = async (req, res) => {
    try {
        const categorias = await CategoriaCarta.getAll();
        res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar categorias de carta" });
    }
};

exports.getCategoriaCartaById = async (req, res) => {
    try {
        const categoria = await CategoriaCarta.getById(req.params.id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoria de Carta não encontrada" });
        }
        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar categoria de carta" });
    }
};

exports.updateCategoriaCarta = async (req, res) => {
    try {
        const affectedRows = await CategoriaCarta.update(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Categoria de Carta não encontrada" });
        }
        res.status(200).json({ message: "Categoria de Carta atualizada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar categoria de carta" });
    }
};

exports.deleteCategoriaCarta = async (req, res) => {
    try {
        const affectedRows = await CategoriaCarta.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: "Categoria de Carta não encontrada" });
        }
        res.status(200).json({ message: "Categoria de Carta deletada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar categoria de carta" });
    }
};


