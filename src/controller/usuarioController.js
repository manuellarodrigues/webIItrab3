import userService from '../service/userService.js'; ////delegando a camada service a responsabilidade de tratar as regras de negocio
import {atualizarImagemPerfil} from '../model/userModel.js';
import { listarModulos } from '../model/moduloModel.js';
import { findAllUsers } from '../model/userModel.js';

const usuarioController = {
  // renderizando a pagina de login
login: async (req, res) => {
  console.log('Iniciando processo de login...');
  res.clearCookie('token'); // Limpa o cookie de autenticação
  console.log('Cookie de autenticação limpo.');

  const { email, senha } = req.body;

  // Verificar se os campos necessários foram fornecidos
  if (!email || !senha) {
    console.warn('Tentativa de login sem fornecer e-mail ou senha.');
    return res.render('login', { mensagem: 'E-mail e senha são obrigatórios.' });
  }

  console.log(`Tentativa de login para o e-mail: ${email}`);

  try {
    // Chamar o serviço de login
    const resultado = await userService.login(email, senha);

    // Verificar se o login foi bem-sucedido
    if (!resultado) {
      console.warn(`Login falhou para o e-mail: ${email}`);
      return res.render('login', { mensagem: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
    }

    // Desestruturar o token e usuário
    const { usuario, token } = resultado;

    console.log(`Login bem-sucedido para o usuário: ${usuario.nome}, ID: ${usuario.id}, Papel: ${usuario.papel}`);

    // Armazenar o token em um cookie de forma segura
    res.cookie('token', token, { 
      httpOnly: true, // Impede acesso via JavaScript no lado do cliente
      secure: process.env.NODE_ENV === 'production', // Garante que o cookie só seja enviado via HTTPS em produção
      maxAge: 3600000 // 1 hora
    });
    console.log('Token armazenado no cookie com sucesso.');

    // Agora, redirecionar para o dashboard
    return res.redirect('/api/usuarios/dashboard'); // Redireciona para o dashboard

  } catch (erro) {
    console.error('Erro ao autenticar usuário:', erro.message, erro.stack);

    // Renderizar página de login com mensagem genérica
    res.status(500).render('login', { mensagem: 'Erro ao autenticar usuário. Tente novamente mais tarde.' });
  }
},

  renderizarModuloUsuarios: (req, res) => {
    try {
      // Renderiza a página com um título simples
      res.render('usuario', { titulo: 'Módulo de Usuários' });
    } catch (erro) {
      console.error('Erro ao renderizar módulo de usuários:', erro);
      res.status(500).json({ mensagem: 'Erro ao renderizar módulo de usuários', erro });
    }
  },

  logout: (req, res) => {
    try {
      res.clearCookie('token'); // Remove o cookie de autenticação
      res.redirect('/api/usuarios/login'); // Redireciona para a página de login
    } catch (erro) {
      res.status(500).json({ mensagem: 'Erro ao realizar logout', erro });
    }
  },

  // funcao para renderizar a pagina de perfil
  renderizarUsuarios: (req, res) => {
    try {
      res.render('perfil', { titulo: 'Módulo de Gestão de Perfil' });
    } catch (erro) {
      res.status(500).json({ mensagem: 'Erro ao renderizar módulo de perfil', erro });
    }
  },

  // funcao para cadastrar um usuário
  cadastrarUsuario: async (req, res) => {
    try {
      // Passando o papel do usuário logado para o serviço
      const novoUsuario = await userService.cadastrarUsuario(req.body, req.usuario.papel);
      res.render('cadastroSucesso', {
      mensagem: 'Usuário cadastrado com sucesso!'
      });
    } catch (erro) {
      console.error("Erro ao cadastrar usuário:", erro);  // Exibe o erro detalhado
      res.status(500).json({ mensagem: 'Erro ao cadastrar usuário', erro: erro.message });
    }
  },


  // funcao para listar os usuários
  listarUsuarios: async (req, res) => {
    try {
      const usuarios = await userService.listarUsuarios();
      res.status(200).json(usuarios);
    } catch (erro) {
      res.status(500).json({ mensagem: 'Erro ao listar usuários', erro });
    }
  },

  // funcao para obter um usuário
  obterUsuario: async (req, res) => {
  const { id } = req.params;

  console.log('ID recebido:', id, '| Tipo:', typeof id);

  const idConvertido = parseInt(id, 10); // Converte a string para inteiro

  if (isNaN(idConvertido)) {
    return res.status(400).json({ mensagem: 'ID inválido. Deve ser um número.' });
  }

  try {
    const usuario = await userService.obterUsuarioPorId(idConvertido);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json(usuario);
  } catch (erro) {
    console.error('Erro ao obter usuário:', erro);
    res.status(500).json({ mensagem: 'Erro ao obter usuário', erro });
  }
},


  // funcao para editar um usuário
  editarUsuario: async (req, res) => {
    const { id } = req.params;
    try {
      const usuarioAtualizado = await userService.editarUsuario(id, req.body);
      res.status(200).json(usuarioAtualizado);
    } catch (erro) {
      res.status(500).json({ mensagem: 'Erro ao editar usuário', erro });
    }
  },

  // funcao para remover um usuário
  removerUsuario: async (req, res) => {
    const { id } = req.params;
    try {
      await userService.removerUsuario(id);
      res.status(204).send();
    } catch (erro) {
      res.status(500).json({ mensagem: 'Erro ao remover usuário', erro });
    }
  },

  // funcao para criar um superusuario
  criarSuperUsuario: async () => {
    try {
      await userService.criarSuperUsuario();
    } catch (erro) {
      console.error('Erro ao criar o superusuário', erro);
    }
  },

  // funcao para obter o dashboard do usuário
  getDashboard: async (req, res) => {
  try {
    const usuario = req.usuario; 
    console.log('Dados do usuário autenticado:', usuario);

    // obtendo os dados do dashboard
    const dadosDashboard = await userService.getDashboardData(usuario.id);

    console.log('Permissões detalhadas do usuário logado:', 
      JSON.stringify(dadosDashboard.usuarioLogado.permissoes, null, 2)
    );

    //extração dos modulos do usuario logado
    const modulos = dadosDashboard.usuarioLogado.permissoes;

    //renderiza o dashboard com os dados obtidos
    res.render('dashboard', { 
      usuario: dadosDashboard.usuarioLogado, 
      usuarios: dadosDashboard.usuarios, 
      modulos
    });
  } catch (erro) {
    console.error('Erro ao carregar o dashboard:', erro);
    res.status(500).json({ mensagem: 'Erro ao carregar o dashboard', erro: erro.message || erro });
  }
},

configurarPermissoesPagina: async (req, res) => {
    try {
      // obtendo todos os usuários e módulos
      const usuarios = await findAllUsers(); 
      const modulos = await listarModulos(); 

      // renderizando a página EJS de configuração de permissões
      res.render('configurar-permissoes', { usuarios, modulos });
    } catch (erro) {
      console.error('Erro ao carregar a página de configurações de permissões:', erro);
      res.status(500).json({ mensagem: 'Erro ao carregar a página de configurações' });
    }
  },

  // funcao para configurar as permissoes de um usuário
  configurarPermissoes: async (req, res) => {
    const { usuarioId, permissoes } = req.body;
    try {
      const resultado = await userService.configurarPermissoes(usuarioId, permissoes);
      res.status(200).json({ mensagem: 'Permissões configuradas com sucesso!', resultado });
    } catch (erro) {
      console.error('Erro ao configurar permissões:', erro);
      res.status(500).json({ mensagem: 'Erro ao configurar permissões', erro });
    }
  },

  // funcao para listar as permissões disponíveis
  listarPermissoes: async (req, res) => {
    try {
      const permissoes = await userService.listarPermissoes();
      res.status(200).json(permissoes);
    } catch (erro) {
      console.error('Erro ao listar permissões:', erro);
      res.status(500).json({mensagem: 'Erro ao listar permissões', erro });
    }
  },
  atualizarImagem: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhuma imagem foi enviada." });
      }

      const caminhoImagem = req.file.path;
      const usuarioId = parseInt(req.params.id);

      // atualizando a imagem de perfil do usuário
      await atualizarImagemPerfil(usuarioId, caminhoImagem);

      res.status(200).json({ mensagem: "Imagem atualizada com sucesso!", caminhoImagem });
    } catch (erro) {
      res.status(500).json({ mensagem: "Erro ao atualizar a imagem.", erro: erro.message });
    }
  },
};

export default usuarioController;
