// routes/relatorioRoutes.js
import express from 'express';
import { renderizarPaginaRelatorio, listarRelatorios } from '../controller/relatoriosController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// middleware de autenticação para todas as rotas abaixo
router.use(authMiddleware.verificarToken);

// rota para acessar a página de relatórios
router.get('/', authMiddleware.verificarPermissao('Relatórios'), renderizarPaginaRelatorio);

// rota para listar relatórios
router.get('/listar', authMiddleware.verificarPermissao('Relatórios'), listarRelatorios);

export default router;
