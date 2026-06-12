const { Router } = require('express');

const { registrarUsuario, login, actualizarPerfil } = require('../controllers/auth.controller');
const router = Router();

const { verificarToken } = require('../middlewares/auth.middleware');
ure/colecciones

// Rutas para autenticación
router.post('/registro', registrarUsuario);
router.post('/login', login);
router.put('/perfil', verificarToken, actualizarPerfil);
ature/colecciones

module.exports = router;