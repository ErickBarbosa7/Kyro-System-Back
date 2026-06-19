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

// GET: Obtener todos los gastos (Soporta papelera)
const obtenerGastos = async (req, res) => {
    try {
        const { estado } = req.query;

        let filtro = { activo: true };

        if (estado === 'inactivos') {
            filtro = { activo: false };
        } else if (estado === 'todos') {
            filtro = {};
        }

        const gastos = await prisma.gastoOperativo.findMany({
            where: filtro,
            orderBy: { fecha: 'desc' }
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

const reactivarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.gastoOperativo.update({
            where: { id },
            data: { activo: true }
        });
        res.json({ mensaje: 'Gasto reactivado correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Gasto no encontrado' });
        res.status(500).json({ error: 'Error interno al reactivar el gasto' });
    }
};

module.exports = { crearGasto, obtenerGastos, actualizarGasto, eliminarGasto, reactivarGasto };