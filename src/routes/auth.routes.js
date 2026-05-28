const { Router } = require('express');
const { registrarUsuario, login } = require('../controllers/auth.controller');

const router = Router();

// Rutas para autenticación
router.post('/registro', registrarUsuario);
router.post('/login', login);

module.exports = router;