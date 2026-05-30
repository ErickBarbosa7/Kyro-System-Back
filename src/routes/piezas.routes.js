const { Router } = require('express');
const {
    crearPieza,
    obtenerPiezas,
    obtenerPiezaPorId,
    actualizarPieza,
    eliminarPieza
} = require('../controllers/piezas.controller');

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Si tienes un schema de Zod para la pieza, descomenta estas líneas:
// const { validarEsquema } = require('../middlewares/validator.middleware');
// const { crearPiezaSchema } = require('../schemas/pieza.schema');

const router = Router();

// 1. Guardia general: Todas las rutas de piezas requieren estar autenticado (Logueado)
router.use(verificarToken);

// 2. Rutas del CRUD
 
router.post('/', verificarRol('ADMINISTRADOR', 'PRODUCCION'), crearPieza); 
router.get('/', obtenerPiezas); 
router.get('/:id', obtenerPiezaPorId);
router.put('/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), actualizarPieza); 
router.delete('/:id', verificarRol('ADMINISTRADOR'), eliminarPieza);

module.exports = router;