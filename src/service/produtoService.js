// services/produtoService.js
import { listarProdutosDB } from '../model/produtoModel.js';

const listarProdutos = async () => {
  return await listarProdutosDB();
};

export default { listarProdutos };
