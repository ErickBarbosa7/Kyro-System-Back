const { Router } = require('express');
const { 
    crearMaterial, 
    obtenerMateriales, 
    obtenerMaterialPorId, 
    actualizarMaterial, 
    eliminarMaterial,
    reactivarMaterial
} = require('../controllers/materiales.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearMaterialSchema } = require('../schemas/material.schema');
const { uploadImage } = require('../middlewares/upload.middleware');

const router = Router();

// Todas las rutas de materiales requieren estar logueado
router.use(verificarToken);

// GET, DELETE y REACTIVAR no manejan archivos, se quedan igual
router.get('/', obtenerMateriales);
router.get('/:id', obtenerMaterialPorId);
router.delete('/:id', eliminarMaterial);
router.put('/:id/reactivar', reactivarMaterial);

// POST y PUT: Primero extraemos el FormData (Multer), luego Validamos, luego al Controlador
router.post('/', uploadImage.single('imagen'), validarEsquema(crearMaterialSchema), crearMaterial);

router.put('/:id', uploadImage.single('imagen'), validarEsquema(crearMaterialSchema.partial()), actualizarMaterial);

module.exports = router;