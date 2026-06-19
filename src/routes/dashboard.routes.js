const { Router } = require('express');
const { obtenerResumen } = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

router.get('/resumen', obtenerResumen);

module.exports = router;
