const prisma = require('../db');

const crearTipoPieza = async (req, res) => {
    try {
        const data = req.body;
        const nuevoTipo = await prisma.tipoPieza.create({ data });
        res.status(201).json(nuevoTipo);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un tipo de pieza con este código' });
        res.status(500).json({ error: 'Error interno al registrar el tipo de pieza' });
    }
};

const obtenerTiposPieza = async (req, res) => {
    try {
        const tipos = await prisma.tipoPieza.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' }
        });
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de pieza' });
    }
};

const actualizarTipoPieza = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const tipoActualizado = await prisma.tipoPieza.update({
            where: { id },
            data
        });
        res.json(tipoActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Tipo de pieza no encontrado' });
        if (error.code === 'P2002') return res.status(400).json({ error: 'El código ya está en uso' });
        res.status(500).json({ error: 'Error interno al actualizar' });
    }
};

const eliminarTipoPieza = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.tipoPieza.update({
            where: { id },
            data: { activo: false }
        });
        res.json({ mensaje: 'Tipo de pieza eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el tipo de pieza' });
    }
};

module.exports = { crearTipoPieza, obtenerTiposPieza, actualizarTipoPieza, eliminarTipoPieza };