const { Router } = require('express');
const { crearPieza } = require('../controllers/piezas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const { crearPiezaSchema } = require('../schemas/pieza.schema');

const router = Router();
router.use(verificarToken);

router.post('/', validarEsquema(crearPiezaSchema), crearPieza);

module.exports = router;