const Veiculo = require("../models/Veiculo");

exports.createVeiculo = async (req, res) => {
  try {
    const veiculoId = await Veiculo.create(req.body);
    res.status(201).json({ message: "Veículo criado com sucesso", veiculoId });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar veículo", error: error.message });
  }
};

exports.getAllVeiculos = async (req, res) => {
  try {
    const veiculos = await Veiculo.getAll();
    res.status(200).json(veiculos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar veículos", error: error.message });
  }
};

exports.getVeiculoById = async (req, res) => {
  try {
    const veiculo = await Veiculo.getById(req.params.id);
    if (!veiculo) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }
    res.status(200).json(veiculo);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar veículo", error: error.message });
  }
};

exports.updateVeiculo = async (req, res) => {
  try {
    const affectedRows = await Veiculo.update(req.params.id, req.body);
    if (!affectedRows) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }
    res.status(200).json({ message: "Veículo atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar veículo", error: error.message });
  }
};

exports.deleteVeiculo = async (req, res) => {
  try {
    const affectedRows = await Veiculo.delete(req.params.id);
    if (!affectedRows) {
      return res.status(404).json({ message: "Veículo não encontrado" });
    }
    res.status(200).json({ message: "Veículo deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar veículo", error: error.message });
  }
}; 