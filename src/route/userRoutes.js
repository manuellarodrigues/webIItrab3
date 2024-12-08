import express from 'express';
import usuarioController from '../controller/usuarioController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// middleware global para proteger rotas (todas as rotas abaixo exigem autenticação)
router.use(authMiddleware.verificarToken);

router.get('/dashboard', usuarioController.getDashboard);
router.get('/cadastro', authMiddleware.verificarPermissaoCadastro, (req, res) => {
  const usuario = req.usuario;  // Aqui você pega o usuário logado
  res.render('cadastro', { usuario });  // Passa o objeto usuario para a view
});
router.post('/cadastro', authMiddleware.verificarPermissaoCadastro, usuarioController.cadastrarUsuario);

// rota para exibir o formulário de configuração de permissões (GET)
router.get('/configurar-permissoes', authMiddleware.verificarAdmin, usuarioController.configurarPermissoesPagina);

// rota para tratar a submissão do formulário de configuração de permissões (POST)
router.post('/configurar-permissoes', authMiddleware.verificarAdmin, usuarioController.configurarPermissoes);

router.get('/:id/permissoes', authMiddleware.verificarAdmin, usuarioController.listarPermissoes);
router.get('/', authMiddleware.verificarPermissao('Usuários'), usuarioController.renderizarModuloUsuarios);
router.get('/:id(\\d+)', authMiddleware.verificarPermissao('Usuários'), usuarioController.obterUsuario); // ID numérico
router.put('/:id(\\d+)', authMiddleware.verificarProprioUsuario, usuarioController.editarUsuario); // ID numérico
router.delete('/:id(\\d+)', authMiddleware.verificarSuperAdmin, usuarioController.removerUsuario); // ID numérico

export default router;
