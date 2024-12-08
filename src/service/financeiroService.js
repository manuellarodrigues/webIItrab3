// services/financeiroService.js
import { listarTransacoesDB } from '../model/financeiroModel.js';

const listarTransacoes = async () => {
  return await listarTransacoesDB();
};

export default { listarTransacoes };
