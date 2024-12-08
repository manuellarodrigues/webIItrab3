//camada model responsavel por interagir com o banco de dados prisma

import bcrypt from 'bcrypt'; //importando o bcrypt para a criptografia
import prisma from '../../prisma/client.js'; // importando o Prisma Client
import { ROLES_VALIDOS, PERMISSOES_POR_PAPEL } from '../config/constantes.js'; // Importando as configurações

export const criarSuperUsuario = async () => {
  console.log('Iniciando a criação do superusuário...');

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: 'super@admin.com' },
  });

  if (usuarioExistente) {
    console.log('Superusuário já existe!');
    return; // Não precisa continuar se o superusuário já existir
  }

  const papel = "SUPER"; // Definindo explicitamente a role

  // Validando o papel de superusuário
  if (!ROLES_VALIDOS.includes(papel)) {
    throw new Error(`O papel "${papel}" é inválido. Valores válidos são: ${ROLES_VALIDOS.join(", ")}`);
  }
  console.log('Papel validado:', papel);

  const senhaCriptografada = await bcrypt.hash('senhaSuper', 10); // Criptografando a senha com bcrypt
  console.log('Senha criptografada');

  // Criando o superusuário
  const superUsuario = await prisma.usuario.create({
    data: {
      nome: 'Super Usuário',
      email: 'super@admin.com',
      senha: senhaCriptografada,
      papel,
      imagem: null,
    },
  });

  console.log('Superusuário criado com sucesso!', superUsuario);

  // Associando permissões para o superusuário
  await associarPermissoes(superUsuario.id, papel);

  const modulos = await prisma.modulo.findMany(); // buscando todos os modulos
  console.log('Módulos disponíveis:', modulos); // exibindo os modulos disponiveis
  
  for (let modulo of modulos) {
    console.log(`Atribuindo permissão para o módulo: ${modulo.nome}`); // exibindo o modulo
    await prisma.permissao.create({
      data: {
        usuarioId: superUsuario.id,
        moduloId: modulo.id,
        permissao: 'ACESSO',
      },
    });
    console.log(`Permissão de acesso ao módulo "${modulo.nome}" foi atribuída ao superusuário.`);
  }
};

// function para associar permissões de acordo com o papel do usuário
const associarPermissoes = async (usuarioId, papel) => {
  console.log(`Iniciando associação de permissões para o usuário ${usuarioId} com papel ${papel}`);

  // Pegando os módulos permitidos de acordo com o papel
  const modulosPermitidos = PERMISSOES_POR_PAPEL[papel] || [];
  console.log('Módulos permitidos para o papel:', modulosPermitidos);

  // Verificando se os módulos permitidos foram definidos corretamente
  if (modulosPermitidos.length === 0) {
    console.error(`Nenhum módulo permitido encontrado para o papel "${papel}". Verifique os dados em PERMISSOES_POR_PAPEL.`);
  }

  // Buscando os módulos correspondentes no banco de dados
  const modulos = await prisma.modulo.findMany({
    where: {
      nome: {
        in: modulosPermitidos
      }
    }
  });
  console.log('Módulos encontrados no banco de dados:', modulos);

  // Verificando se os módulos foram encontrados corretamente
  if (modulos.length === 0) {
    console.error(`Nenhum módulo encontrado no banco de dados para os módulos permitidos: ${modulosPermitidos.join(", ")}`);
  }

  // Criando as permissões para o usuário com os módulos encontrados
  const permissoes = modulos.map(modulo => ({
    usuarioId: usuarioId,
    moduloId: modulo.id,
  }));
  console.log('Permissões a serem criadas:', permissoes);

  // Verificando se as permissões foram geradas corretamente
  if (permissoes.length === 0) {
    console.error(`Nenhuma permissão gerada para o usuário ${usuarioId}. Verifique os módulos e permissões.`);
  }

  try {
    // Verificando se as permissões já existem antes de tentar criar
    for (const permissao of permissoes) {
      const permissaoExistente = await prisma.permissao.findFirst({
        where: {
          usuarioId: permissao.usuarioId,
          moduloId: permissao.moduloId,
        },
      });

      if (!permissaoExistente) {
        // Inserindo a permissão no banco de dados
        await prisma.permissao.create({
          data: permissao,
        });
        console.log(`Permissão para o módulo ${permissao.moduloId} criada com sucesso!`);
      } else {
        console.log(`Permissão já existe para o módulo ${permissao.moduloId}`);
      }
    }
  } catch (error) {
    console.error('Erro ao criar permissões:', error);
  }
};


//function para criar um novo usuario com validacao de role
export const criarUsuario = async (nome, email, senha, papel, imagem = null) => {
  console.log(`Iniciando a criação do usuário: ${nome}...`);

  // Verifica se o papel é válido
  if (!ROLES_VALIDOS.includes(papel)) { 
    throw new Error(`O papel "${papel}" é inválido. Valores válidos são: ${ROLES_VALIDOS.join(", ")}`);
  }
  console.log('Papel validado:', papel);
  
  console.log('Senha original antes de criptografar:', senha);
  // Criptografando a senha
  const senhaCriptografada = await bcrypt.hash(senha, 10); 
  console.log('Senha criptografada');

  // Criando o novo usuário no banco de dados
  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaCriptografada,
      papel,
      imagem,
    },
  });

  console.log('Usuário criado com sucesso!', novoUsuario);

  // Associando permissões de acordo com o papel do usuário
  await associarPermissoes(novoUsuario.id, papel);

  return novoUsuario;
};

//function para verificacao de senha durante o login
export const verificarSenha = async (senhaInput, senhaHash) => {
  return await bcrypt.compare(senhaInput, senhaHash); // comparando a senha fornecida com a hash no banco
};

//function para buscar um usuario pelo email
export const findByEmail = async (email) => {
  if (!email) {
    throw new Error('E-mail não fornecido.');
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Verificar se o usuário foi encontrado
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    return usuario;
  } catch (erro) {
    console.error('Erro ao buscar usuário por email:', erro);
    throw erro; // Repassa o erro para ser tratado em outro lugar
  }
};

//function para atualizar as permissões de um usuario
export const configurarPermissoes = async (usuarioId, modulosIds) => {
  // removendo todas as permissões do usuário
  await prisma.permissao.deleteMany({
    where: { usuarioId },
  });

  // criando as novas permissões
  const permissoes = modulosIds.map((moduloId) => ({
    usuarioId,
    moduloId,
  }));

  // criando as novas permissões no banco
  return await prisma.permissao.createMany({
    data: permissoes,
  });
};

//function para verificar se um usuario tem permissao para acessar um modulo
export const temPermissaoParaAcessarModulo = async (usuarioId, moduloNome) => {
  const permissao = await prisma.permissao.findFirst({
    where: {
      usuarioId,
      modulo: {
        nome: moduloNome,
      },
    },
    include: {
      modulo: true,
    },
  });

  return permissao ? true : false; // retorna true se o usuario tem permissão
};

//function para registrar o acesso de um usuário
export const registrarAcesso = async (usuarioId, url, concedido) => {
  return await prisma.acesso.create({
    data: {
      usuarioId,
      url,
      concedido,
    },
  });
};

//funcion para listar todos os usuários com seus modulos acessíveis
export const listarUsuariosComModulos = async () => {
  return await prisma.usuario.findMany({
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });
};

//function para atualizar imagem de perfil de um usuario
export const atualizarImagemPerfil = async (usuarioId, caminhoImagem) => {
  return await prisma.usuario.update({
    where: { id: usuarioId },
    data: { imagem: caminhoImagem },
  });
};

//function getDashboardData para obter os dados do dashboard
export const getDashboardData = async (usuarioId) => {
  //buscando unicamente o usuario logado em que as permissoes de modulo sao incluidas
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });

  if (!usuario) throw new Error('Usuário não encontrado'); // se o usuario nao for encontrado, retorna um erro

  //buscando todos os usuarios
  const usuarios = await prisma.usuario.findMany({
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });

  return {
    usuarioLogado: {
      id: usuario.id,
      nome: usuario.nome,
      papel: usuario.papel,
      permissoes: usuario.permissoes.map(p => p.modulo),
    },
    usuarios: usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      papel: u.papel,
      permissoes: u.permissoes.map(p => p.modulo),
    })),
  };
};

//function para listar todas as permissoes disponiveis
export const listarPermissoes = async () => {
  return await prisma.permissao.findMany({
    include: { usuario: true, modulo: true },
  });
};

// function para buscar usuário pelo ID, incluindo permissões de módulos
export const findById = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });
};

// function para buscar todos os usuários, incluindo permissões de módulos
export const findAllUsers = async () => {
  return await prisma.usuario.findMany({
    include: {
      permissoes: {
        include: { modulo: true },
      },
    },
  });
};

//function para atualizar as permissões de um usuario
export const updatePermissions = async (usuarioId, permissoes) => {
  try {
    // convertendo usuarioId para inteiro
    const usuarioIdInt = parseInt(usuarioId, 10);

    // convertendo para int para resolver o erro de comparacao de string e int
    if (isNaN(usuarioIdInt)) {
      throw new Error('ID de usuário inválido');
    }

    // limpando permissoes anteriores
    await prisma.permissao.deleteMany({
      where: { usuarioId: usuarioIdInt },  // Agora passando o usuarioId como inteiro
    });

    // obtendo os ids dos modulos com base nos nomes dos módulos
    const modulosIds = await Promise.all(permissoes.map(async (nomeModulo) => {
      const modulo = await prisma.modulo.findUnique({
        where: { nome: nomeModulo },
        select: { id: true },
      });
      return modulo?.id; 
    }));

    const modulosIdsValidos = modulosIds.filter(id => id !== undefined);

    // adicionando as novas permissões
    const permissoesToCreate = modulosIdsValidos.map(moduloId => ({
      usuarioId: usuarioIdInt, 
      moduloId,
    }));

    // criando as novas permissões no banco
    const novasPermissoes = await prisma.permissao.createMany({
      data: permissoesToCreate,
    });

    return novasPermissoes;
  } catch (erro) {
    console.error('Erro ao atualizar permissões:', erro);
    throw new Error('Erro ao atualizar permissões');
  }
};
