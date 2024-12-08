// controllers/produtosController.js
import produtoService from '../service/produtoService.js';

export const renderizarPaginaProduto = (req, res) => {
  res.render('produto', { titulo: 'Módulo de Produtos' });
};

export const listarProdutos = async (req, res) => {
  try {
    const produtos = await produtoService.listarProdutos();
    res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao listar produtos' });
  }
};
