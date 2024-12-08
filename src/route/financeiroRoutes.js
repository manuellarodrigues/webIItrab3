// routes/financeiroRoutes.js
import express from 'express';
import { listarTransacoes, renderizarPaginaFinanceira } from '../controller/financeiroController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// middleware de autenticação para todas as rotas abaixo
router.use(authMiddleware.verificarToken);

// rota para acessar a página financeira
router.get('/', authMiddleware.verificarPermissao('Financeiros'), renderizarPaginaFinanceira);

// rota para listar financeiro
router.get('/listar', authMiddleware.verificarPermissao('Financeiros'), listarTransacoes);

export default router;
