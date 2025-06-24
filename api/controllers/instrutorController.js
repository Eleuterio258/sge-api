const Instrutor = require("../models/Instrutor");

exports.createInstrutor = async (req, res) => {
  try {
    const instrutorId = await Instrutor.create(req.body);
    res.status(201).json({ message: "Instrutor criado com sucesso", instrutorId });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar instrutor", error: error.message });
  }
};

exports.getAllInstrutores = async (req, res) => {
  try {
    const instrutores = await Instrutor.getAll();
    res.status(200).json(instrutores);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar instrutores", error: error.message });
  }
};

exports.getInstrutorById = async (req, res) => {
  try {
    const instrutor = await Instrutor.getById(req.params.id);
    if (!instrutor) {
      return res.status(404).json({ message: "Instrutor não encontrado" });
    }
    res.status(200).json(instrutor);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar instrutor", error: error.message });
  }
};

exports.updateInstrutor = async (req, res) => {
  try {
    const affectedRows = await Instrutor.update(req.params.id, req.body);
    if (!affectedRows) {
      return res.status(404).json({ message: "Instrutor não encontrado" });
    }
    res.status(200).json({ message: "Instrutor atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar instrutor", error: error.message });
  }
};

exports.deleteInstrutor = async (req, res) => {
  try {
    const affectedRows = await Instrutor.delete(req.params.id);
    if (!affectedRows) {
      return res.status(404).json({ message: "Instrutor não encontrado" });
    }
    res.status(200).json({ message: "Instrutor deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar instrutor", error: error.message });
  }
}; 