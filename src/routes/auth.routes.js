const { Router } = require('express');
const { registrarUsuario, login, actualizarPerfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/registro', registrarUsuario);
router.post('/login', login);
router.put('/perfil', verificarToken, actualizarPerfil);

module.exports = router;