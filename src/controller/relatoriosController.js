// controllers/relatoriosController.js
import relatorioService from '../service/relatorioService.js';

export const renderizarPaginaRelatorio = (req, res) => {
  res.render('relatorio', { titulo: 'Módulo de Relatórios' });
};

export const listarRelatorios = async (req, res) => {
  try {
    const relatorios = await relatorioService.listarRelatorios();
    res.status(200).json(relatorios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar relatórios' });
  }
};
