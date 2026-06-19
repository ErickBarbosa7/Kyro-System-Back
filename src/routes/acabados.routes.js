const { Router } = require('express');
const { crearAcabado, obtenerAcabados, actualizarAcabado, eliminarAcabado, reactivarAcabado } = require('../controllers/acabados.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearAcabadoSchema } = require('../schemas/acabado.schema');

const router = Router();

router.use(verificarToken);

router.post('/', validarEsquema(crearAcabadoSchema), crearAcabado);
router.get('/', obtenerAcabados);
router.put('/:id', validarEsquema(crearAcabadoSchema.partial()), actualizarAcabado);
router.delete('/:id', eliminarAcabado);
router.put('/:id/reactivar', verificarRol('ADMINISTRADOR'), reactivarAcabado);

module.exports = router;