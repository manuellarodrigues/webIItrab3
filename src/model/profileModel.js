// models/profileModel.js
import prisma from '../../prisma/client.js';
import path from 'path';

export const obterUsuarioPorId = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id: parseInt(id) },
  });
};

export const atualizarImagemPerfil = async (id, caminhoImagem) => {
  const nomeArquivo = path.basename(caminhoImagem);
  return await prisma.usuario.update({
    where: { id: parseInt(id) },
    data: { imagem: nomeArquivo },
  });
};