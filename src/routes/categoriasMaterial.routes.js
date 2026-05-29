const { Router } = require('express');
const { 
    crearCategoria, 
    obtenerCategorias, 
    actualizarCategoria, 
    eliminarCategoria 
} = require('../controllers/categoriasMaterial.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { categoriaMaterialSchema } = require('../schemas/categoriaMaterial.schema');

const router = Router();

// Todas las rutas protegidas
router.use(verificarToken);

router.post('/', validarEsquema(categoriaMaterialSchema), crearCategoria);
router.get('/', obtenerCategorias);
// Para actualizar usamos el mismo esquema pero .partial() por si solo mandan el nombre
router.put('/:id', validarEsquema(categoriaMaterialSchema.partial()), actualizarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;