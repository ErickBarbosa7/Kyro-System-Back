const { Router } = require('express');
const { 
    crearMaterial, 
    obtenerMateriales, 
    obtenerMaterialPorId, 
    actualizarMaterial, 
    eliminarMaterial 
} = require('../controllers/materiales.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearMaterialSchema } = require('../schemas/material.schema');

const router = Router();

// Todas las rutas de materiales requieren estar logueado
router.use(verificarToken);

router.post('/', validarEsquema(crearMaterialSchema), crearMaterial);
router.get('/', obtenerMateriales);
router.get('/:id', obtenerMaterialPorId);
// Nota: Usamos el mismo esquema pero parcial para actualizar
router.put('/:id', validarEsquema(crearMaterialSchema.partial()), actualizarMaterial);
router.delete('/:id', eliminarMaterial);

module.exports = router;