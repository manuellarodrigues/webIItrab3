// routes/produtoRoutes.js
import express from 'express';
import { renderizarPaginaProduto, listarProdutos } from '../controller/produtosController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// middleware de autenticação para todas as rotas abaixo
router.use(authMiddleware.verificarToken);

// rota para acessar a página de produtos
router.get('/', authMiddleware.verificarPermissao('Produtos'), renderizarPaginaProduto);

// rota para listar produtos
router.get('/listar', authMiddleware.verificarPermissao('Produtos'), listarProdutos);

export default router;
