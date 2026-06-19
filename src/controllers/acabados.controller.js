const prisma = require('../db');

// POST: Crear Acabado
const crearAcabado = async (req, res) => {
    try {
        const data = req.body;

        if (data.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({ where: { id: data.proveedorId } });
            if (!proveedorExiste) return res.status(404).json({ error: 'El proveedor asignado no existe' });
        }

        const nuevoAcabado = await prisma.acabado.create({
            data: {
                ...data,
                proveedorId: data.proveedorId || null // Aseguramos que sea null si viene vacío
            }
        });

        res.status(201).json(nuevoAcabado);
    } catch (error) {
        console.error('Error al crear acabado:', error);
        res.status(500).json({ error: 'Error interno al registrar el acabado' });
    }
};

// GET: Obtener todos los Acabados (Soporta papelera)
const obtenerAcabados = async (req, res) => {
    try {
        const { estado } = req.query;

        let filtro = { activo: true };

        if (estado === 'inactivos') {
            filtro = { activo: false };
        } else if (estado === 'todos') {
            filtro = {};
        }

        const acabados = await prisma.acabado.findMany({
            where: filtro,
            orderBy: { nombre: 'asc' },
            include: {
                proveedor: { select: { nombre: true } }
            }
        });
        res.json(acabados);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los acabados' });
    }
};

// PUT: Actualizar Acabado
const actualizarAcabado = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({ where: { id: data.proveedorId } });
            if (!proveedorExiste) return res.status(404).json({ error: 'El nuevo proveedor asignado no existe' });
        }

        const acabadoActualizado = await prisma.acabado.update({
            where: { id },
            data
        });

        res.json(acabadoActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Acabado no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar el acabado' });
    }
};

// DELETE: Eliminar Acabado (Soft-Delete)
const eliminarAcabado = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.acabado.update({
            where: { id },
            data: { activo: false }
        });
        res.json({ mensaje: 'Acabado eliminado correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Acabado no encontrado' });
        res.status(500).json({ error: 'Error interno al eliminar el acabado' });
    }
};

// PUT: Reactivar Acabado (Sacar de la papelera)
const reactivarAcabado = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.acabado.update({
            where: { id },
            data: { activo: true }
        });

        res.json({ mensaje: 'Acabado reactivado correctamente' });
    } catch (error) {
        console.error('Error en reactivarAcabado:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Acabado no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al reactivar el acabado' });
    }
};

module.exports = { crearAcabado, obtenerAcabados, actualizarAcabado, eliminarAcabado, reactivarAcabado };