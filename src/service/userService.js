import bcrypt from 'bcrypt';
import * as userModel from '../model/userModel.js';
import { gerarToken } from './tokenService.js';

const userService = {
  // funcao para autenticar um usuário
    async login(email, senha) {
    console.log('Iniciando o processo de login para o e-mail:', email);

    // buscando o usuário pelo e-mail
    const usuario = await userModel.findByEmail(email);
    if (!usuario) {
      console.warn('Usuário não encontrado para o e-mail:', email);
      return null; // Se não encontrar, retorna null
    }

    console.log('Usuário encontrado:', usuario.id);

    // verificando se a senha fornecida é válida
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      console.warn('Senha inválida fornecida para o e-mail:', email);
      return null; // se a senha for inválida, retorna null
    }

    console.log('Senha válida para o usuário:', usuario.id);

    // gerando o token de autenticação
    const token = gerarToken(usuario);

    if (!token) {
      console.error('Erro ao gerar o token para o usuário:', usuario.id);
      return null; // caso haja erro na geração do token
    }

    console.log('Token gerado com sucesso para o usuário:', usuario.id);

    // retornando o usuário e o token
    return { usuario, token };
  },


  // funcao para cadastrar um usuario
  async cadastrarUsuario(dados, papelUsuarioLogado) {
  const { nome, email, senha, papel, imagem } = dados;

  // verificando se o papel do usuário logado é ADMIN
  if (papelUsuarioLogado === 'ADMIN' && (papel === 'ADMIN' || papel === 'SUPER')) {
    throw new Error('Administradores não podem criar outros administradores ou superusuários');
  }

  try {
    const novoUsuario = await userModel.criarUsuario(nome, email, senha, papel, imagem);
    return novoUsuario;
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    throw new Error("Erro ao cadastrar usuário");
  }
},

  // funcao para listar os usuarios
  async listarUsuarios() {
    return userModel.listarUsuariosComModulos();
  },

  // funcao para obter um usuario
  async obterUsuarioPorId(id) {
    return userModel.findById(id);
  },

  // funcao para editar um usuario
  async editarUsuario(id, dados) {
    if (dados.senha) {
      dados.senha = bcrypt.hashSync(dados.senha, 10);
    }
    return userModel.updateUser(id, dados);
  },

  // funcao para remover um usuario
  async removerUsuario(id) {
    return userModel.deleteUser(id);
  },

  // funcao para criar um superusuario
  async criarSuperUsuario() {

    //verificando se o superusuario ja existe (o userModel que cria o superusuario hardcoded)
    const superUsuarioExistente = await userModel.findByEmail('superusuario@dominio.com');
    
    //se nao existir, cria o superusuario
    if (!superUsuarioExistente) {
      const senhaCriptografada = await bcrypt.hash('senhaSuperSecreta', 10);
      await userModel.createUser({
        nome: 'Super Usuário',
        email: 'superusuario@dominio.com',
        senha: senhaCriptografada,
        papel: 'superusuario',
      });
      console.log('Superusuário criado com sucesso!');
    }
  },

  // funcao para verificar permissoes
  async verificarPermissoes(usuarioId, moduloId) {
    
    const usuario = await userModel.findById(usuarioId);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // se o usuário for superusuário, ele tem acesso a todos os módulos
    if (usuario.papel === 'SUPER') {
      return true; // superusuarios tem acesso irrestrito
    }

    // verificando se o usuário tem permissão para acessar o módulo
    const temPermissao = await userModel.temPermissaoParaAcessarModulo(usuarioId, moduloId);

    if (!temPermissao) {
      throw new Error('Sem permissão para acessar este módulo');
    }

    return true; 
  },


  // funcao para obter os dados do dashboard
async getDashboardData(usuarioId) {
  // buscando o usuário logado, incluindo suas permissões e detalhes do módulo
  const usuario = await userModel.findById(usuarioId, {
    include: {
      permissoes: {
        include: { modulo: true }, // Inclui os detalhes do módulo
      },
    },
  });

  if (!usuario) throw new Error('Usuário não encontrado');

  // buscando todos os usuários, incluindo permissões e módulos
  const usuarios = await userModel.findAllUsers({
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });

  console.log('Módulos que o usuário tem acesso:', usuario.permissoes.map(p => p.modulo.nome));

  // retornando os dados do dashboard
  return {
    usuarioLogado: {
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
      permissoes: usuario.permissoes.map(p => ({
        id: p.id,
        nome: p.modulo.nome, 
        moduloId: p.modulo.id,
      })),
    },
    usuarios: usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      papel: u.papel,
      permissoes: u.permissoes.map(p => ({
        id: p.id,
        nome: p.modulo.nome, 
        moduloId: p.modulo.id,
      })),
    })),
  };
},

  // funcao para configurar permissoes
  async configurarPermissoes(usuarioId, permissoes) {
  try {
    const resultado = await userModel.updatePermissions(usuarioId, permissoes);
    return resultado;
  } catch (erro) {
    console.error('Erro no serviço ao configurar permissões:', erro);
    throw new Error('Erro ao configurar permissões');
  }
},

  // funcao para listar permissoes
  async listarPermissoes() {
    return userModel.findAllPermissions(); // lista todas as permissoes
  },
};

export default userService;
