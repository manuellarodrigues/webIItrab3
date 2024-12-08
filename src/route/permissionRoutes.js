// permissionRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { listarPermissoesController } from '../controller/permissionController.js';
import { adicionarPermissaoController } from '../controller/permissionController.js';
import { removerPermissaoController } from '../controller/permissionController.js';

const router = express.Router();

// rota para listar as permissões de acesso de usuários a módulos
router.get('/permissoes', authMiddleware.verificarPermissao(['ADMIN', 'SUPER']), listarPermissoesController);

// rota para adicionar permissões de acesso a um usuário
router.post('/permissoes/adicionar', authMiddleware.verificarPermissao(['ADMIN', 'SUPER']), adicionarPermissaoController);

// rota para remover permissões de acesso de um usuário
router.delete('/permissoes/remover', authMiddleware.verificarPermissao(['ADMIN', 'SUPER']), removerPermissaoController);

export default router;
