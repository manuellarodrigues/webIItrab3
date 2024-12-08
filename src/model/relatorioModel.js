// models/relatorioModel.js
import prisma from '../../prisma/client.js';

export const listarRelatoriosDB = async () => {
  return await prisma.relatorio.findMany();
};
