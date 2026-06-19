const { Router } = require('express');
const {
    obtenerMovimientos,
    obtenerMovimientoPorId,
    crearMovimiento,
    eliminarMovimiento
} = require('../controllers/stock.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', verificarRol('ADMINISTRADOR', 'PRODUCCION'), crearMovimiento);
router.delete('/:id', verificarRol('ADMINISTRADOR'), eliminarMovimiento);

module.exports = router;
