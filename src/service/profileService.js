// services/profileService.js
import { obterUsuarioPorId, atualizarImagemPerfil } from '../model/profileModel.js';

const obterPerfil = async (id) => {
  try {
    const usuario = await obterUsuarioPorId(id);
    console.log(`Perfil encontrado para o usuário ID ${id}:`, usuario);
    return usuario;
  } catch (error) {
    console.error(`Erro ao buscar perfil no serviço para o ID ${id}:`, error.message);
    throw error;
  }
};

const atualizarImagem = async (id, caminhoImagem) => {
  try {
    if (!caminhoImagem) {
      throw new Error('Caminho da imagem não pode ser vazio.');
    }
    const usuarioAtualizado = await atualizarImagemPerfil(id, caminhoImagem);
    if (!usuarioAtualizado) {
      throw new Error(`Usuário com ID ${id} não encontrado para atualização.`);
    }
    return usuarioAtualizado;
  } catch (error) {
    console.error(`Erro ao atualizar a imagem de perfil: ${error.message}`);
    throw error; 
  }
};

export default { obterPerfil, atualizarImagem };
