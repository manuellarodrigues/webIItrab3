import prisma from '../../prisma/client.js';

// funcao para listar todos os módulos disponniveis no sistema
export const listarModulos = async () => {
  try {
    const modulos = await prisma.modulo.findMany();

    return modulos;
  } catch (erro) {
    console.error('Erro ao listar módulos:', erro);
    throw new Error('Erro ao listar módulos');
  }
};
