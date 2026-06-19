const prisma = require('../db');

const obtenerResumen = async (req, res) => {
    try {
        const [
            totalPiezas,
            piezasActivas,
            piezasPorColeccion,
            piezasPorTipo,
            todosMateriales,
            todosMetales,
            gastos,
            ultimosMovimientos,
            ultimasPiezas,
            configMargenes
        ] = await Promise.all([
            prisma.pieza.count(),
            prisma.pieza.count({ where: { estado: 'ACTIVO' } }),
            prisma.pieza.groupBy({
                by: ['coleccionId'],
                _count: { id: true },
                where: { estado: 'ACTIVO' },
            }),
            prisma.pieza.groupBy({
                by: ['tipoId'],
                _count: { id: true },
                where: { estado: 'ACTIVO' },
            }),
            prisma.material.findMany({
                where: { activo: true },
                select: { stockDisponible: true, costoUnitario: true, stockMinimo: true }
            }),
            prisma.metal.findMany({
                where: { activo: true },
                select: { stockDisponible: true, precioPorGramo: true, stockMinimo: true }
            }),
            prisma.gastoOperativo.findMany({
                where: { activo: true },
                select: { monto: true, periodicidad: true, categoria: true, fecha: true }
            }),
            prisma.inventarioMovimiento.findMany({
                take: 5,
                orderBy: { fecha: 'desc' },
                include: {
                    usuario: { select: { nombre: true, apellido: true } }
                }
            }),
            prisma.pieza.findMany({
                take: 5,
                where: { estado: 'ACTIVO' },
                orderBy: { fechaCreacion: 'desc' },
                select: {
                    id: true,
                    clave: true,
                    nombreComercial: true,
                    fechaCreacion: true,
                    tipo: { select: { nombre: true } },
                    coleccion: { select: { nombre: true } }
                }
            }),
            prisma.configuracionMargen.findMany({
                where: { activo: true },
                select: { nombre: true, margenTaller: true, margenMayorista: true, margenPublico: true }
            })
        ]);

        const totalMateriales = todosMateriales.length;
        const totalMetales = todosMetales.length;

        const materialesBajoStock = todosMateriales.filter(
            m => Number(m.stockMinimo) > 0 && Number(m.stockDisponible) <= Number(m.stockMinimo)
        ).length;

        const materialesAgotados = todosMateriales.filter(
            m => Number(m.stockDisponible) <= 0
        ).length;

        const metalesStockCritico = todosMetales.filter(
            m => Number(m.stockMinimo) > 0 && Number(m.stockDisponible) <= Number(m.stockMinimo)
        ).length;

        const valorInventarioMateriales = todosMateriales.reduce(
            (sum, m) => sum + Number(m.stockDisponible) * Number(m.costoUnitario), 0
        );
        const valorInventarioMetales = todosMetales.reduce(
            (sum, m) => sum + Number(m.stockDisponible) * Number(m.precioPorGramo), 0
        );
        const valorTotalInventario = valorInventarioMateriales + valorInventarioMetales;

        const gastosAcumulados = gastos.reduce((sum, g) => sum + Number(g.monto), 0);

        const gastosPorCategoria = gastos.reduce((acc, g) => {
            acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.monto);
            return acc;
        }, {});

        const colecciones = await Promise.all(
            piezasPorColeccion.map(async (g) => {
                const col = await prisma.coleccion.findUnique({
                    where: { id: g.coleccionId },
                    select: { nombre: true }
                });
                return { nombre: col?.nombre || 'Sin colección', total: g._count.id };
            })
        );

        const tipos = await Promise.all(
            piezasPorTipo.map(async (g) => {
                const t = await prisma.tipoPieza.findUnique({
                    where: { id: g.tipoId },
                    select: { nombre: true }
                });
                return { nombre: t?.nombre || 'Sin tipo', total: g._count.id };
            })
        );

        res.json({
            piezas: {
                total: totalPiezas,
                activas: piezasActivas,
                porColeccion: colecciones,
                porTipo: tipos,
                ultimas: ultimasPiezas
            },
            inventario: {
                totalMateriales,
                materialesBajoStock,
                materialesAgotados,
                totalMetales,
                metalesStockCritico,
                valorTotalInventario
            },
            finanzas: {
                gastosAcumulados,
                gastosPorCategoria,
                configuracionMargenes: configMargenes
            },
            actividadReciente: ultimosMovimientos
        });
    } catch (error) {
        console.error('Error en obtenerResumen:', error);
        res.status(500).json({ error: 'Error interno al obtener el resumen del dashboard' });
    }
};

module.exports = { obtenerResumen };
