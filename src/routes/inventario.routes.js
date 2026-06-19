const { Router } = require('express');
const { obtenerResumenInventario } = require('../controllers/inventario.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

router.get('/', obtenerResumenInventario);

module.exports = router;
