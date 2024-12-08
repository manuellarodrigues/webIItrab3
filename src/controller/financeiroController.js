// controllers/financeiroController.js
import financeiroService from '../service/financeiroService.js';

export const renderizarPaginaFinanceira = (req, res) => {
  res.render('financeiro', { titulo: 'Módulo Financeiro' });
};

export const listarTransacoes = async (req, res) => {
  try {
    const transacoes = await financeiroService.listarTransacoes();
    res.status(200).json(transacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar transações' });
  }
};
