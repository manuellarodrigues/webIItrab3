// services/relatorioService.js
import { listarRelatoriosDB } from '../model/relatorioModel.js';

const listarRelatorios = async () => {
  return await listarRelatoriosDB();
};

export default { listarRelatorios };
