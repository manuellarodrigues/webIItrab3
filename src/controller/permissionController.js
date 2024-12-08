// permissionController.js
import { listarPermissoes, adicionarPermissao, removerPermissao } from '../service/permissionService.js';

export const listarPermissoesController = async (req, res) => {
  try {
    const permissoes = await permissionService.listarPermissoes();
    res.status(200).json(permissoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const adicionarPermissaoController = async (req, res) => {
  const { usuarioId, moduloId } = req.body;

  try {
    const permissao = await permissionService.adicionarPermissao(usuarioId, moduloId);
    res.status(201).json(permissao);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export const removerPermissaoController = async (req, res) => {
  const { usuarioId, moduloId } = req.body;

  try {
    await permissionService.removerPermissao(usuarioId, moduloId);
    res.status(200).json({ message: 'Permissão removida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
