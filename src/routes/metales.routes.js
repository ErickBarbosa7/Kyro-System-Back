const { Router } = require('express');
const { crearMetal, obtenerMetales, actualizarMetal, eliminarMetal } = require('../controllers/metales.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearMetalSchema } = require('../schemas/metal.schema');

const router = Router();

router.use(verificarToken); // Protegemos todo

router.post('/', validarEsquema(crearMetalSchema), crearMetal);
router.get('/', obtenerMetales);
router.put('/:id', validarEsquema(crearMetalSchema.partial()), actualizarMetal);
router.delete('/:id', eliminarMetal);
module.exports = router;