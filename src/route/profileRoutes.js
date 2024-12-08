import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import profileController from '../controller/profileController.js';
import profileService from '../service/profileService.js';

const router = express.Router();

router.use(authMiddleware.verificarToken);

router.get('/', async (req, res) => {
  const { id, papel } = req.usuario; // ID e papel do usuário autenticado

  if (!id) {
    return res.status(400).json({ mensagem: 'Usuário não autenticado' });
  }

  if (papel === 'SUPER') {
    // Superusuário redirecionado para página com campo de busca
    return res.render('editarPerfilSuper', {
      titulo: 'Painel do Superusuário',
      id, // ID do superusuário
      papel,
    });
  }

  // Usuário comum redirecionado para seu próprio perfil
  res.redirect(`/api/perfil/${id}`);
});

// rota para superusuário buscar perfis de outros usuários
router.get('/buscar', authMiddleware.verificarSuperAdmin, async (req, res) => {
  const { idUsuario } = req.query;

  if (!idUsuario) {
    return res.status(400).json({ mensagem: 'ID do usuário é obrigatório' });
  }

  try {
    const perfil = await profileService.obterPerfil(idUsuario);
    if (!perfil) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.render('perfil', {
    titulo: `Perfil de ${perfil.nome}`,
    imagemPerfil: perfil.imagem ? `/uploads/${perfil.imagem.replace(/\\/g, '/')}` : '/uploads/default.png',
    id: perfil.id,
    papel: req.usuario.papel,
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    res.status(500).json({ mensagem: 'Erro ao buscar perfil' });
  }
});

// rota para visualizar o perfil (do próprio usuário)
router.get('/:id', authMiddleware.verificarProprioUsuario, profileController.obterPerfil);

// rota para edição da imagem de perfil (somente o próprio usuário)
router.post('/:id/imagem', authMiddleware.verificarProprioUsuarioOuSuperAdmin, upload.single('imagem'), profileController.atualizarImagem);
 
export default router;
