const { Router } = require('express');
const { crearTipoPieza, obtenerTiposPieza, actualizarTipoPieza, eliminarTipoPieza } = require('../controllers/tiposPieza.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearTipoPiezaSchema } = require('../schemas/tiposPieza.schema');

const router = Router();
router.use(verificarToken);

router.post('/', validarEsquema(crearTipoPiezaSchema), crearTipoPieza);
router.get('/', obtenerTiposPieza);
router.put('/:id', validarEsquema(crearTipoPiezaSchema.partial()), actualizarTipoPieza);
router.delete('/:id', eliminarTipoPieza);

module.exports = router;