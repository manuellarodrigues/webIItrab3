// config/constantes.js

const ROLES_VALIDOS = ["SUPER", "ADMIN", "USER"];

const PERMISSOES_POR_PAPEL = {
  SUPER: ['Usuários', 'Relatórios', 'Financeiros', 'Produtos'],
  ADMIN: ['Usuários', 'Relatórios', 'Financeiros', 'Produtos'],
  USER: ['Perfil']
};

export { ROLES_VALIDOS, PERMISSOES_POR_PAPEL };
