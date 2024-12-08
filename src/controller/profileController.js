import profileService from '../service/profileService.js';

const obterPerfil = async (req, res) => {
  const { id } = req.params;

  try {
    const perfil = await profileService.obterPerfil(id);
    if (!perfil) {
      console.error(`Usuário com ID ${id} não encontrado.`);
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.render('perfil', {
      titulo: 'Perfil do Usuário',
      imagemPerfil: perfil.imagem ? `/uploads/${perfil.imagem.replace(/^uploads[\\/]/, '').replace(/\\/g, '/')}` : '/uploads/default.png',
      id: perfil.id,
      papel: req.usuario.papel,
      usuarioLogadoId: req.usuario.id
    });
  } catch (error) {
    console.error('Erro no controlador ao obter perfil:', error.message);
    res.status(500).json({ mensagem: 'Erro ao obter perfil' });
  }
};

const atualizarImagem = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ mensagem: 'Nenhuma imagem foi enviada.' });
  }

  const caminhoImagem = req.file.path;

  try {
    const perfilAtualizado = await profileService.atualizarImagem(id, caminhoImagem);
    res.status(200).json({ mensagem: 'Imagem atualizada com sucesso!', perfilAtualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar imagem' });
  }
};

export default { obterPerfil, atualizarImagem };
