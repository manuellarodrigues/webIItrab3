// models/financeiroModel.js
import prisma from '../../prisma/client.js';

export const listarTransacoesDB = async () => {
  return await prisma.transacao.findMany();
};
