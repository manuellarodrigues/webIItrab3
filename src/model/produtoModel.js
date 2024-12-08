// models/produtoModel.js
import prisma from '../../prisma/client.js';

export const listarProdutosDB = async () => {
  return await prisma.produto.findMany();
};
