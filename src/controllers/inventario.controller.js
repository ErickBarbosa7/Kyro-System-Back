const prisma = require('../db');

const obtenerResumenInventario = async (req, res) => {
    try {
        const { tipo } = req.query;

        let materiales = [];
        let metales = [];

        if (!tipo || tipo === 'material') {
            materiales = await prisma.material.findMany({
                where: { activo: true },
                select: {
                    id: true,
                    nombre: true,
                    stockDisponible: true,
                    stockMinimo: true,
                    stockMaximo: true,
                    costoUnitario: true,
                    unidadMedida: { select: { nombre: true } }
                },
                orderBy: { nombre: 'asc' }
            });
        }

        if (!tipo || tipo === 'metal') {
            metales = await prisma.metal.findMany({
                where: { activo: true },
                select: {
                    id: true,
                    nombre: true,
                    stockDisponible: true,
                    stockMinimo: true,
                    precioPorGramo: true
                },
                orderBy: { nombre: 'asc' }
            });
        }

        const materialesConValor = materiales.map(m => ({
            ...m,
            tipo: 'MATERIAL',
            valorInventario: Number(m.stockDisponible) * Number(m.costoUnitario),
            estado: Number(m.stockDisponible) <= 0 ? 'AGOTADO'
                : Number(m.stockDisponible) <= Number(m.stockMinimo) * 0.2 ? 'CRITICO'
                : Number(m.stockDisponible) <= Number(m.stockMinimo) ? 'BAJO'
                : 'DISPONIBLE'
        }));

        const metalesConValor = metales.map(m => ({
            ...m,
            tipo: 'METAL',
            unidadMedida: { nombre: 'Gramo' },
            valorInventario: Number(m.stockDisponible) * Number(m.precioPorGramo),
            estado: Number(m.stockDisponible) <= 0 ? 'AGOTADO'
                : Number(m.stockDisponible) <= Number(m.stockMinimo) * 0.2 ? 'CRITICO'
                : Number(m.stockDisponible) <= Number(m.stockMinimo) ? 'BAJO'
                : 'DISPONIBLE'
        }));

        const items = [...materialesConValor, ...metalesConValor];

        res.json(items);
    } catch (error) {
        console.error('Error en obtenerResumenInventario:', error);
        res.status(500).json({ error: 'Error interno al obtener el resumen de inventario' });
    }
};

module.exports = { obtenerResumenInventario };
