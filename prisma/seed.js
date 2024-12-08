import prisma from './client.js';

export async function seed() {
  // Populando a tabela de módulos com os módulos fixos
  const modulos = [
    { nome: 'Usuários' },
    { nome: 'Relatórios' },
    { nome: 'Financeiros' },
    { nome: 'Produtos' },
    { nome: 'Perfil' }, // Adicionando o módulo Perfil
  ];

  console.log('Iniciando o seed dos módulos...');

  // Criando os módulos ou atualizando (evita duplicação)
  for (const modulo of modulos) {
    const moduloCriado = await prisma.modulo.upsert({
      where: { nome: modulo.nome },
      update: {}, // Não precisa atualizar, apenas garantir que o módulo existe
      create: modulo,
    });
    console.log(`Módulo processado: ${moduloCriado.nome} (ID: ${moduloCriado.id})`);
  }

  console.log('Seed dos módulos concluído.');
}

// Executando o seed
seed()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Fecha a conexão do Prisma
    console.log('Conexão com o banco encerrada.');
  });
