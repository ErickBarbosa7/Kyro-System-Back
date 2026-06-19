const { Router } = require('express');
const {
    obtenerSkusPorPieza,
    crearSku,
    actualizarSku,
    eliminarSku
} = require('../controllers/piezasSku.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

router.get('/:piezaId', obtenerSkusPorPieza);
router.post('/:piezaId', verificarRol('ADMINISTRADOR', 'PRODUCCION'), crearSku);
router.put('/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), actualizarSku);
router.delete('/:id', verificarRol('ADMINISTRADOR'), eliminarSku);

module.exports = router;
