const prisma = require('../db');

const obtenerMovimientos = async (req, res) => {
    try {
        const { tipoProducto, tipoMovimiento, fechaDesde, fechaHasta, limit, offset } = req.query;

        const filtro = {};

        if (tipoProducto) filtro.tipoProducto = tipoProducto;
        if (tipoMovimiento) filtro.tipoMovimiento = tipoMovimiento;
        if (fechaDesde || fechaHasta) {
            filtro.fecha = {};
            if (fechaDesde) filtro.fecha.gte = new Date(fechaDesde);
            if (fechaHasta) filtro.fecha.lte = new Date(fechaHasta);
        }

        const movimientos = await prisma.inventarioMovimiento.findMany({
            where: filtro,
            include: {
                usuario: { select: { nombre: true, apellido: true } }
            },
            orderBy: { fecha: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            skip: offset ? parseInt(offset) : undefined,
        });

        res.json(movimientos);
    } catch (error) {
        console.error('Error en obtenerMovimientos:', error);
        res.status(500).json({ error: 'Error interno al obtener movimientos de stock' });
    }
};

const obtenerMovimientoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const movimiento = await prisma.inventarioMovimiento.findUnique({
            where: { id },
            include: {
                usuario: { select: { nombre: true, apellido: true } }
            }
        });

        if (!movimiento) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }

        res.json(movimiento);
    } catch (error) {
        console.error('Error en obtenerMovimientoPorId:', error);
        res.status(500).json({ error: 'Error interno al obtener el movimiento' });
    }
};

const crearMovimiento = async (req, res) => {
    try {
        const { tipoProducto, productoId, tipoMovimiento, cantidad, motivo } = req.body;
        const usuarioId = req.usuario.id;

        const cantidadNum = Number(cantidad);
        if (cantidadNum <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor a cero' });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            if (tipoProducto === 'MATERIAL') {
                const material = await tx.material.findUnique({ where: { id: productoId } });
                if (!material) throw new Error('El material no existe');

                const stockAnterior = Number(material.stockDisponible);
                let stockActual = stockAnterior;

                if (tipoMovimiento === 'ENTRADA') {
                    stockActual = stockAnterior + cantidadNum;
                } else if (tipoMovimiento === 'SALIDA' || tipoMovimiento === 'MERMA') {
                    if (stockAnterior < cantidadNum) {
                        throw new Error('Stock insuficiente para realizar la salida');
                    }
                    stockActual = stockAnterior - cantidadNum;
                } else if (tipoMovimiento === 'AJUSTE') {
                    stockActual = cantidadNum;
                }

                await tx.material.update({
                    where: { id: productoId },
                    data: { stockDisponible: stockActual }
                });
            } else if (tipoProducto === 'METAL') {
                const metal = await tx.metal.findUnique({ where: { id: productoId } });
                if (!metal) throw new Error('El metal no existe');

                const stockAnterior = Number(metal.stockDisponible);
                let stockActual = stockAnterior;

                if (tipoMovimiento === 'ENTRADA') {
                    stockActual = stockAnterior + cantidadNum;
                } else if (tipoMovimiento === 'SALIDA' || tipoMovimiento === 'MERMA') {
                    if (stockAnterior < cantidadNum) {
                        throw new Error('Stock insuficiente para realizar la salida');
                    }
                    stockActual = stockAnterior - cantidadNum;
                } else if (tipoMovimiento === 'AJUSTE') {
                    stockActual = cantidadNum;
                }

                await tx.metal.update({
                    where: { id: productoId },
                    data: { stockDisponible: stockActual }
                });
            } else if (tipoProducto === 'ACABADO') {
                const acabado = await tx.acabado.findUnique({ where: { id: productoId } });
                if (!acabado) throw new Error('El acabado no existe');
            } else {
                throw new Error('Tipo de producto inválido');
            }

            const movimiento = await tx.inventarioMovimiento.create({
                data: {
                    tipoProducto,
                    productoId,
                    tipoMovimiento,
                    cantidad: cantidadNum,
                    motivo,
                    usuarioId,
                },
                include: {
                    usuario: { select: { nombre: true, apellido: true } }
                }
            });

            return movimiento;
        });

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en crearMovimiento:', error);
        if (error.message === 'El material no existe' || error.message === 'El metal no existe' || error.message === 'El acabado no existe') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Stock insuficiente para realizar la salida') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Tipo de producto inválido') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno al crear el movimiento de stock' });
    }
};

const eliminarMovimiento = async (req, res) => {
    try {
        const { id } = req.params;

        const movimiento = await prisma.inventarioMovimiento.findUnique({ where: { id } });
        if (!movimiento) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }

        await prisma.$transaction(async (tx) => {
            const cantidad = Number(movimiento.cantidad);

            if (movimiento.tipoProducto === 'MATERIAL') {
                const material = await tx.material.findUnique({ where: { id: movimiento.productoId } });
                if (material) {
                    let stockActual = Number(material.stockDisponible);

                    if (movimiento.tipoMovimiento === 'ENTRADA') {
                        stockActual = Math.max(0, stockActual - cantidad);
                    } else if (movimiento.tipoMovimiento === 'SALIDA' || movimiento.tipoMovimiento === 'MERMA') {
                        stockActual = stockActual + cantidad;
                    }

                    await tx.material.update({
                        where: { id: movimiento.productoId },
                        data: { stockDisponible: stockActual }
                    });
                }
            } else if (movimiento.tipoProducto === 'METAL') {
                const metal = await tx.metal.findUnique({ where: { id: movimiento.productoId } });
                if (metal) {
                    let stockActual = Number(metal.stockDisponible);

                    if (movimiento.tipoMovimiento === 'ENTRADA') {
                        stockActual = Math.max(0, stockActual - cantidad);
                    } else if (movimiento.tipoMovimiento === 'SALIDA' || movimiento.tipoMovimiento === 'MERMA') {
                        stockActual = stockActual + cantidad;
                    }

                    await tx.metal.update({
                        where: { id: movimiento.productoId },
                        data: { stockDisponible: stockActual }
                    });
                }
            }

            await tx.inventarioMovimiento.delete({ where: { id } });
        });

        res.json({ mensaje: 'Movimiento eliminado correctamente' });
    } catch (error) {
        console.error('Error en eliminarMovimiento:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al eliminar el movimiento' });
    }
};

module.exports = { obtenerMovimientos, obtenerMovimientoPorId, crearMovimiento, eliminarMovimiento };
