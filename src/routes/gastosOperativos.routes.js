const { Router } = require('express');
const { crearGasto, obtenerGastos, actualizarGasto, eliminarGasto, reactivarGasto } = require('../controllers/gastosOperativos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearGastoOperativoSchema } = require('../schemas/gastoOperativo.schema');

const router = Router();

router.use(verificarToken);

router.post('/', validarEsquema(crearGastoOperativoSchema), crearGasto);
router.get('/', obtenerGastos);
router.put('/:id', validarEsquema(crearGastoOperativoSchema.partial()), actualizarGasto);
router.delete('/:id', eliminarGasto);
router.put('/:id/reactivar', reactivarGasto);

module.exports = router;