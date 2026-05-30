const { Router } = require('express');
const { 
    crearProveedor, 
    obtenerProveedores, 
    actualizarProveedor, 
    eliminarProveedor 
} = require('../controllers/proveedores.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearProveedorSchema, actualizarProveedorSchema } = require('../schemas/proveedor.schema');

const router = Router();

// Protegemos todas las rutas
router.use(verificarToken);

// CRUD de Proveedores
router.post('/', validarEsquema(crearProveedorSchema), crearProveedor);
router.get('/', obtenerProveedores);
router.put('/:id', validarEsquema(actualizarProveedorSchema), actualizarProveedor);
router.delete('/:id', eliminarProveedor);

module.exports = router;