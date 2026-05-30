const prisma = require('../db');

const crearConfiguracion = async (req, res) => {
    try {
        const nuevaConfiguracion = await prisma.configuracionMargen.create({ data: req.body });
        res.status(201).json(nuevaConfiguracion);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la configuración de márgenes' });
    }
};

const obtenerConfiguraciones = async (req, res) => {
    try {
        const configuraciones = await prisma.configuracionMargen.findMany({
            where: { activo: true }
        });
        res.json(configuraciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las configuraciones' });
    }
};

const actualizarConfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        const configActualizada = await prisma.configuracionMargen.update({
            where: { id },
            data: req.body
        });
        res.json(configActualizada);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Configuración no encontrada' });
        res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
};

const eliminarConfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.configuracionMargen.update({
            where: { id },
            data: { activo: false }
        });
        res.json({ mensaje: 'Configuración eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la configuración' });
    }
};

module.exports = { crearConfiguracion, obtenerConfiguraciones, actualizarConfiguracion, eliminarConfiguracion };