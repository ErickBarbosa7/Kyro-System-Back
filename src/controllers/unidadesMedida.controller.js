const prisma = require('../db');

// GET: Obtener todas las unidades (con filtro de estado)
const obtenerUnidades = async (req, res) => {
    try {
        const { estado } = req.query;
        let filtro = { activa: true };

        if (estado === 'inactivas') filtro = { activa: false };
        else if (estado === 'todas') filtro = {};

        const unidades = await prisma.unidadMedida.findMany({
            where: filtro,
            orderBy: { nombre: 'asc' }
        });
        
        res.json(unidades);
    } catch (error) {
        console.error('Error en obtenerUnidades:', error);
        res.status(500).json({ error: 'Error al obtener las unidades de medida' });
    }
};

// POST: Crear una nueva unidad
const crearUnidad = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        // Verificar si ya existe para evitar errores de Prisma
        const existe = await prisma.unidadMedida.findUnique({ where: { nombre } });
        if (existe) {
            return res.status(400).json({ error: 'Ya existe una unidad de medida con este nombre' });
        }

        const nuevaUnidad = await prisma.unidadMedida.create({
            data: { nombre }
        });

        res.status(201).json(nuevaUnidad);
    } catch (error) {
        console.error('Error en crearUnidad:', error);
        res.status(500).json({ error: 'Error al crear la unidad de medida' });
    }
};

// PUT: Actualizar unidad
const actualizarUnidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const unidadActualizada = await prisma.unidadMedida.update({
            where: { id },
            data: { nombre }
        });

        res.json(unidadActualizada);
    } catch (error) {
        console.error('Error en actualizarUnidad:', error);
        res.status(500).json({ error: 'Error al actualizar la unidad de medida' });
    }
};

// DELETE: Eliminar unidad (Soft-delete)
const eliminarUnidad = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.unidadMedida.update({
            where: { id },
            data: { activa: false }
        });

        res.json({ mensaje: 'Unidad de medida enviada a la papelera' });
    } catch (error) {
        console.error('Error en eliminarUnidad:', error);
        res.status(500).json({ error: 'Error al eliminar la unidad de medida' });
    }
};

// PUT: Reactivar unidad (Sacar de la papelera)
const reactivarUnidad = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.unidadMedida.update({
            where: { id },
            data: { activa: true }
        });

        res.json({ mensaje: 'Unidad restaurada correctamente' });
    } catch (error) {
        console.error('Error en reactivarUnidad:', error);
        res.status(500).json({ error: 'Error al restaurar la unidad de medida' });
    }
};

module.exports = {
    obtenerUnidades,
    crearUnidad,
    actualizarUnidad,
    eliminarUnidad,
    reactivarUnidad
};