import express from 'express';
import usuarioController from '../controller/usuarioController.js';

const router = express.Router();

// rota pública de login
router.get('/login', (req, res) => {
  res.render('login'); // renderizando a página de login
});

// rota pública de login
router.post('/login', 
  (req, res, next) => {
    console.log('Requisição POST recebida para /login');
    next(); 
  }, 
  (req, res, next) => {
    console.log('Chegando no controlador de login');
    next();
  },
  (req, res) => {
    console.log('Dentro da função login do controller');
    usuarioController.login(req, res);
  }
);

// rota pública de logout
router.get('/logout', usuarioController.logout);

export default router;
