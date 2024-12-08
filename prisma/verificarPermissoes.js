import prisma from './client.js';
import { PERMISSOES_POR_PAPEL } from '../src/config/constantes.js';

const verificarPermissoes = async () => {
  try {
    // Verifique se os módulos foram criados corretamente
    const modulos = await prisma.modulo.findMany();
    console.log('Módulos disponíveis:', modulos);

    // Verifique se as permissões foram criadas corretamente
    const permissoes = await prisma.permissao.findMany({
      include: {
        modulo: true,
        usuario: true,
      },
    });
    console.log('Permissões existentes:', permissoes);

    // Verificar permissões do superusuário
    const superUsuario = await prisma.usuario.findUnique({
      where: { email: 'super@admin.com' },
      include: {
        permissoes: {
          include: { modulo: true },
        },
      },
    });

    if (superUsuario) {
      console.log('Permissões do superusuário:', superUsuario.permissoes.map(p => p.modulo.nome));
    } else {
      console.log('Superusuário não encontrado.');
    }

    // Verificação das permissões para cada papel
    const resultadosVerificacao = [];

    for (const [papel, modulosPermitidos] of Object.entries(PERMISSOES_POR_PAPEL)) {
      // Buscar usuários com o papel atual
      const usuarios = await prisma.usuario.findMany({
        where: { papel },
        include: {
          permissoes: {
            include: { modulo: true },
          },
        },
      });

      usuarios.forEach(usuario => {
        const modulosDoUsuario = usuario.permissoes.map(p => p.modulo.nome);
        const permissoesCorretas = modulosPermitidos.every(modulo => modulosDoUsuario.includes(modulo));
        
        resultadosVerificacao.push({
          usuario: usuario.email,
          papel,
          permissoesCorretas,
          modulosEsperados: modulosPermitidos,
          modulosRecebidos: modulosDoUsuario,
        });
      });
    }

    console.log('Resultados da Verificação das Permissões:', resultadosVerificacao);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    process.exit(1);
  }
};

verificarPermissoes();
