const { Router } = require('express');
const { crearConfiguracion, obtenerConfiguraciones, actualizarConfiguracion, eliminarConfiguracion } = require('../controllers/configuracionMargen.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearConfiguracionMargenSchema } = require('../schemas/configuracionMargen.schema');

const router = Router();
router.use(verificarToken);

router.post('/', validarEsquema(crearConfiguracionMargenSchema), crearConfiguracion);
router.get('/', obtenerConfiguraciones);
router.put('/:id', validarEsquema(crearConfiguracionMargenSchema.partial()), actualizarConfiguracion);
router.delete('/:id', eliminarConfiguracion);

module.exports = router;