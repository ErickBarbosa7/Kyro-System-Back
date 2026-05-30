const prisma = require('../db');

// POST: Crear Gasto Operativo
const crearGasto = async (req, res) => {
    try {
        const data = req.body;

        const nuevoGasto = await prisma.gastoOperativo.create({
            data
        });

        res.status(201).json(nuevoGasto);
    } catch (error) {
        console.error('Error al crear gasto operativo:', error);
        res.status(500).json({ error: 'Error interno al registrar el gasto' });
    }
};

// GET: Obtener todos los gastos activos
const obtenerGastos = async (req, res) => {
    try {
        const gastos = await prisma.gastoOperativo.findMany({
            where: { activo: true },
            orderBy: { fecha: 'desc' } // Ordenamos del más reciente al más antiguo
        });
        res.json(gastos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los gastos operativos' });
    }
};

// PUT: Actualizar Gasto
const actualizarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const gastoActualizado = await prisma.gastoOperativo.update({
            where: { id },
            data
        });

        res.json(gastoActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Gasto no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar el gasto' });
    }
};

// DELETE: Eliminar Gasto (Baja Lógica)
const eliminarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.gastoOperativo.update({
            where: { id },
            data: { activo: false }
        });
        res.json({ mensaje: 'Gasto operativo eliminado correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Gasto no encontrado' });
        res.status(500).json({ error: 'Error interno al eliminar el gasto' });
    }
};

module.exports = { crearGasto, obtenerGastos, actualizarGasto, eliminarGasto };