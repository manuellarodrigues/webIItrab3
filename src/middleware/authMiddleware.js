// meus middlewares responsáveis por gerenciar autenticações e permissões

import jwt from 'jsonwebtoken';
import { temPermissaoParaAcessarModulo } from '../model/userModel.js';

const authMiddleware = {
  verificarToken: (req, res, next) => {
    const rotasPublicas = ['/api/auth/login', '/api/auth/logout'];

    // Ignorar middleware para rotas públicas
    if (rotasPublicas.includes(req.path)) {
      console.log(`Rota pública acessada sem verificação de token: ${req.path}`);
      return next(); // Permite continuar sem verificar token
    }

    let token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      console.error('Token ausente nos cabeçalhos ou cookies');
      return res.status(401).json({ mensagem: 'Token ausente' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (!payload.id || !payload.papel) {
        console.error('Token inválido: Payload incompleto', payload);
        return res.status(401).json({ mensagem: 'Token inválido' });
      }

      req.usuario = payload; // Atribui o payload ao request
      console.log('Usuário autenticado com sucesso:', req.usuario);

      next();
    } catch (erro) {
      console.error('Erro ao verificar token:', erro.message);
      res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
  },

  //middleware que verifica se um usuario eh SUPERADMIN
  verificarSuperAdmin: (req, res, next) => {
    console.log(`Verificando se o usuário é SUPER: ID ${req.usuario.id}, Papel ${req.usuario.papel}`);
    if (req.usuario.papel !== 'SUPER') {
      console.log('Acesso negado: Usuário não é SUPER.');
      return res.status(403).render('erro', { mensagem: 'Acesso negado: Apenas superusuários podem acessar esta funcionalidade.' });
    }
    console.log('Usuário é SUPER. Acesso concedido.');
    next();
  },

  //middleware que verifica se um usuario eh ADMIN
  verificarAdmin: (req, res, next) => {
  const papel = req.usuario.papel.toLowerCase(); // Converte para minúsculas
  if (!['admin', 'super'].includes(papel)) {
    return res.status(403).json({ mensagem: 'Acesso negado' });
  }
  next();
  },


  //middleware que verfica se um usuario tem permissao de acessar a um modulo especifico
  verificarPermissao: (modulo) => async (req, res, next) => {
    try {
      console.log('Verificando permissões para o usuário ID:', req.usuario.id);
      console.log('Módulo solicitado:', modulo);

      const temPermissao = await temPermissaoParaAcessarModulo(req.usuario.id, modulo);

      console.log('Permissão encontrada:', temPermissao);

      if (!temPermissao) {
        console.log(`Acesso negado ao módulo "${modulo}" para o usuário ID: ${req.usuario.id}`);
        // renderizando a página de erro com a mensagem apropriada
        return res.status(403).render('erro', { mensagem: `SEM PERMISSÃO PARA ACESSAR O MÓDULO ${modulo}` });
      }

      next();
    } catch (erro) {
      console.error('Erro ao verificar permissões:', erro);
      // renderizando a página de erro em caso de erro inesperado
      res.status(500).render('erro', { mensagem: 'Erro ao verificar permissões. Tente novamente mais tarde.' });
    }
  },

  //middleware responsavel por verificar se o usuario eh de fato o proprio usuario para permitir que ele altere o seu proprio perfil
  verificarProprioUsuario: (req, res, next) => {
    const usuarioLogadoId = req.usuario?.id;
    const usuarioId = parseInt(req.params.id);

    if (!usuarioLogadoId || isNaN(usuarioId)) {
      console.error('IDs inválidos no verificarProprioUsuario:', {
        usuarioLogadoId,
        usuarioId,
      });
      return res.status(400).json({ mensagem: 'IDs inválidos' });
    }

    if (usuarioLogadoId === usuarioId) {
      return next();
    } else {
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar este usuário.' });
    }
  },

  // middleware combinado para verificar se o usuário é SUPER ou está acessando seu próprio perfil
  verificarProprioUsuarioOuSuperAdmin: (req, res, next) => {
    const usuarioLogadoId = req.usuario?.id;
    const usuarioId = parseInt(req.params.id);

    if (!usuarioLogadoId || isNaN(usuarioId)) {
      console.error('IDs inválidos no verificarProprioUsuarioOuSuperAdmin:', {
        usuarioLogadoId,
        usuarioId,
      });
      return res.status(400).json({ mensagem: 'IDs inválidos' });
    }

    if (usuarioLogadoId === usuarioId || req.usuario.papel === 'SUPER') {
      console.log(`Usuário ID ${usuarioLogadoId} é SUPER ou está acessando seu próprio perfil.`);
      return next();
    } else {
      console.log(`Acesso negado para o usuário ID ${usuarioLogadoId}.`);
      return res.status(403).json({ mensagem: 'Você não tem permissão para editar este usuário.' });
    }
  },

  // Novo middleware para verificar se o usuário tem permissão para criar um novo usuário
  verificarPermissaoCadastro: (req, res, next) => {
    const { papel } = req.usuario; // papel do usuário logado

    // Verifica o papel do usuário logado
    if (papel === 'SUPER') {
      console.log('Superusuário pode criar qualquer tipo de usuário.');
      return next(); // Superusuário pode criar qualquer tipo de usuário
    }

    // Se for administrador, ele pode criar apenas usuários comuns
    if (papel === 'ADMIN') {
      // Verifica o papel do usuário a ser criado
      const { papel: papelNovoUsuario } = req.body;
      if (papelNovoUsuario === 'ADMIN' || papelNovoUsuario === 'SUPER') {
        return res.status(403).json({ mensagem: 'Administradores não podem criar outros administradores ou superusuários.' });
      }
      console.log('Administrador pode criar apenas usuários comuns.');
      return next(); // Administrador pode criar apenas usuários comuns
    }

    // Caso o usuário logado não seja super ou admin
    return res.status(403).json({ mensagem: 'Você não tem permissão para criar usuários.' });
  }
};

export default authMiddleware;
