// permissionService.js
import prisma from '../../prisma/client.js';

export const listarPermissoes = async () => {
  try {
    return await prisma.permissao.findMany({
      include: { usuario: true, modulo: true },
    });
  } catch (error) {
    throw new Error('Erro ao listar permissões');
  }
};

export const adicionarPermissao = async (usuarioId, moduloId) => {
  if (!usuarioId || !moduloId) {
    throw new Error('Usuário e módulo são obrigatórios');
  }

  try {
    return await prisma.permissao.create({
      data: {
        usuarioId,
        moduloId,
      },
    });
  } catch (error) {
    throw new Error('Erro ao adicionar permissão');
  }
};

export const removerPermissao = async (usuarioId, moduloId) => {
  if (!usuarioId || !moduloId) {
    throw new Error('Usuário e módulo são obrigatórios');
  }

  try {
    await prisma.permissao.deleteMany({
      where: {
        usuarioId,
        moduloId,
      },
    });
  } catch (error) {
    throw new Error('Erro ao remover permissão');
  }
};
