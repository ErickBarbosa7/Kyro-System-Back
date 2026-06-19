const { Router } = require('express');
const {
    obtenerCosteoPieza,
    calcularTotales,
    agregarMetal,
    agregarMaterial,
    agregarAcabado,
    agregarManoObra,
    agregarGasto,
    actualizarMetal,
    actualizarMaterial,
    actualizarAcabado,
    actualizarManoObra,
    actualizarGasto,
    eliminarMetal,
    eliminarMaterial,
    eliminarAcabado,
    eliminarManoObra,
    eliminarGasto
} = require('../controllers/costeo.controller');

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const { validarEsquema } = require('../middlewares/validator.middleware');
const {
    costeoMetalSchema,
    costeoMaterialSchema,
    costeoAcabadoSchema,
    costeoManoObraSchema,
    costeoGastoSchema
} = require('../schemas/costeo.schema');

const router = Router();

router.use(verificarToken);

router.get('/:piezaId', obtenerCosteoPieza);
router.get('/:piezaId/totales', calcularTotales);

router.post('/:piezaId/metales', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoMetalSchema), agregarMetal);
router.post('/:piezaId/materiales', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoMaterialSchema), agregarMaterial);
router.post('/:piezaId/acabados', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoAcabadoSchema), agregarAcabado);
router.post('/:piezaId/mano-obra', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoManoObraSchema), agregarManoObra);
router.post('/:piezaId/gastos', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoGastoSchema), agregarGasto);

router.put('/metales/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoMetalSchema.partial()), actualizarMetal);
router.put('/materiales/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoMaterialSchema.partial()), actualizarMaterial);
router.put('/acabados/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoAcabadoSchema.partial()), actualizarAcabado);
router.put('/mano-obra/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoManoObraSchema.partial()), actualizarManoObra);
router.put('/gastos/:id', verificarRol('ADMINISTRADOR', 'PRODUCCION'), validarEsquema(costeoGastoSchema.partial()), actualizarGasto);

router.delete('/metales/:id', verificarRol('ADMINISTRADOR'), eliminarMetal);
router.delete('/materiales/:id', verificarRol('ADMINISTRADOR'), eliminarMaterial);
router.delete('/acabados/:id', verificarRol('ADMINISTRADOR'), eliminarAcabado);
router.delete('/mano-obra/:id', verificarRol('ADMINISTRADOR'), eliminarManoObra);
router.delete('/gastos/:id', verificarRol('ADMINISTRADOR'), eliminarGasto);

module.exports = router;
