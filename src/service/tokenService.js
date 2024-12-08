import jwt from 'jsonwebtoken';

export const gerarToken = (usuario) => {
  if (!usuario.id || !usuario.papel) {
    throw new Error('Dados insuficientes para gerar o token');
  }

  const payload = {
    id: usuario.id,
    nome: usuario.nome, 
    email: usuario.email,
    papel: usuario.papel, 
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};
