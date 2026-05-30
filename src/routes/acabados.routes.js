const { Router } = require('express');
const { crearAcabado, obtenerAcabados, actualizarAcabado, eliminarAcabado } = require('../controllers/acabados.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearAcabadoSchema } = require('../schemas/acabado.schema');

const router = Router();

router.use(verificarToken);

router.post('/', validarEsquema(crearAcabadoSchema), crearAcabado);
router.get('/', obtenerAcabados);
router.put('/:id', validarEsquema(crearAcabadoSchema.partial()), actualizarAcabado);
router.delete('/:id', eliminarAcabado); 

module.exports = router;