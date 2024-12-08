import express from 'express';
import cors from 'cors';
import path from 'path';
import prisma from '../prisma/client.js';
import { fileURLToPath } from 'url';
import userRoutes from './route/userRoutes.js';
import authRoutes from './route/authRoutes.js';
import profileRoutes from './route/profileRoutes.js';
import permissionRoutes from './route/permissionRoutes.js';
import financeiroRoutes from './route/financeiroRoutes.js';
import relatorioRoutes from './route/relatorioRoutes.js';
import produtoRoutes from './route/produtoRoutes.js';
import { criarSuperUsuario } from './model/userModel.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'; 

dotenv.config(); // carregando variáveis de ambiente

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// configurando os middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, '../public')));

// configurando diretório de views e do motor de templates
app.set('views', path.join(process.cwd(), 'views')); 
app.set('view engine', 'ejs');

// middlewares
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/perfil', profileRoutes);
app.use('/api', permissionRoutes);
app.use('/api/financeiros', financeiroRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/produtos', produtoRoutes);

// middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Ocorreu um erro no servidor.' });
});

// listando todos os usuários no banco ao iniciar o servidor
const listarUsuarios = async () => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        permissoes: { include: { modulo: true } },
      },
    });
    console.log('Usuários cadastrados:', usuarios);

    usuarios.forEach((usuario) => {
      console.log(`Usuário: ${usuario.nome} - Permissões:`, usuario.permissoes.map(p => p.modulo.nome));
    });

  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
  }
};

// inicializando o superusuário
(async () => {
  try {
    // verificando se o superusuário já existe
    let superUsuario = await prisma.usuario.findFirst({
      where: { papel: 'SUPER' },
      include: { permissoes: true },
    });

    if (!superUsuario) {
      console.log('Superusuário não encontrado. Criando superusuário...');
      superUsuario = await criarSuperUsuario(); 
    } else {
      console.log('Superusuário já existe!');
    }

    // verificando se o superusuario tem permissões associadas
    if (superUsuario.permissoes.length === 0) {
      console.log('Associando módulos ao superusuário...');
      const modulos = await prisma.modulo.findMany();

      for (const modulo of modulos) {
        await prisma.permissao.create({
          data: {
            usuarioId: superUsuario.id,
            moduloId: modulo.id,
          },
        });
      }

      console.log('Módulos associados ao superusuário.');
    } else {
      console.log('Superusuário já tem permissões associadas.');
    }

    // listando usuários no banco
    await listarUsuarios();

  } catch (erro) {
    console.error('Erro ao inicializar o servidor:', erro);
  }
})();

// rota inicial
app.get('/', (req, res) => {
  res.redirect('/api/auth/login');
});

// inicializando o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
