const prisma = require('../db');

const crearMetal = async (req, res) => {
    try {
        const data = req.body;

        if (data.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({ where: { id: data.proveedorId } });
            if (!proveedorExiste) return res.status(404).json({ error: 'El proveedor asignado no existe' });
        }

        const nuevoMetal = await prisma.metal.create({
            data: {
                ...data,
                fechaActualizacion: new Date() // Sellamos la hora exacta
            }
        });

        res.status(201).json(nuevoMetal);
    } catch (error) {
        console.error('Error al crear metal:', error);
        res.status(500).json({ error: 'Error al registrar el metal' });
    }
};

const obtenerMetales = async (req, res) => {
    try {
        const metales = await prisma.metal.findMany({
            orderBy: { nombre: 'asc' },
            include: {
                proveedor: { select: { nombre: true } }
            }
        });
        res.json(metales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los metales' });
    }
};

const actualizarMetal = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const metalActualizado = await prisma.metal.update({
            where: { id },
            data: {
                ...data,
                fechaActualizacion: new Date() // Actualizamos la estampa de tiempo automáticamente
            }
        });

        res.json(metalActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Metal no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar el metal' });
    }
};


// DELETE: Eliminar metal (Soft-delete)
const eliminarMetal = async (req, res) => {
    try {
        const { id } = req.params;

        // Ocultamos el metal para no romper costeos históricos
        await prisma.metal.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ mensaje: 'Metal eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar metal:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Metal no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al eliminar el metal' });
    }
};

module.exports = { crearMetal, obtenerMetales, actualizarMetal, eliminarMetal };