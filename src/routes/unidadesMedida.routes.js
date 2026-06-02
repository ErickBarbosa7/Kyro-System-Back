const { Router } = require('express');
const { 
    obtenerUnidades, 
    crearUnidad, 
    actualizarUnidad, 
    eliminarUnidad, 
    reactivarUnidad 
} = require('../controllers/unidadesMedida.controller');

const router = Router();

router.get('/', obtenerUnidades);
router.post('/', crearUnidad);
router.put('/:id', actualizarUnidad);
router.delete('/:id', eliminarUnidad);
router.put('/:id/reactivar', reactivarUnidad);

module.exports = router;