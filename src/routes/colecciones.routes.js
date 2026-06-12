const { Router } = require('express');
const { 
    obtenerColecciones, 
    obtenerColeccionPorId,
    crearColeccion,
    actualizarColeccion,
    eliminarColeccion,
    reactivarColeccion 
} = require('../controllers/colecciones.controller');

// Importamos los guardias
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

// Rutas para Colecciones
router.get('/', verificarToken, obtenerColecciones);
router.get('/:id', verificarToken, obtenerColeccionPorId);
router.post('/', verificarToken, verificarRol('ADMINISTRADOR', 'PRODUCCION'), crearColeccion);
router.put('/:id', verificarToken, verificarRol('ADMINISTRADOR', 'PRODUCCION'), actualizarColeccion);
router.delete('/:id', verificarToken, verificarRol('ADMINISTRADOR'), eliminarColeccion);
router.put('/:id/reactivar', verificarToken, verificarRol('ADMINISTRADOR'), reactivarColeccion);


module.exports = router;