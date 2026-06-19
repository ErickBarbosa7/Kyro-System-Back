const prisma = require('../db');

const obtenerSkusPorPieza = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const skus = await prisma.piezaSku.findMany({
            where: { piezaId },
            orderBy: { sku: 'asc' }
        });
        res.json(skus);
    } catch (error) {
        console.error('Error en obtenerSkusPorPieza:', error);
        res.status(500).json({ error: 'Error interno al obtener los SKUs' });
    }
};

const crearSku = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { sku, descripcionVariante } = req.body;

        if (!sku || !sku.trim()) {
            return res.status(400).json({ error: 'El SKU es obligatorio' });
        }

        const existe = await prisma.piezaSku.findUnique({ where: { sku: sku.trim() } });
        if (existe) {
            return res.status(400).json({ error: 'El SKU ya está registrado' });
        }

        const nuevo = await prisma.piezaSku.create({
            data: {
                piezaId,
                sku: sku.trim(),
                descripcionVariante: descripcionVariante?.trim() || undefined
            }
        });

        res.status(201).json(nuevo);
    } catch (error) {
        console.error('Error en crearSku:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El SKU ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno al crear el SKU' });
    }
};

const actualizarSku = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, descripcionVariante, activo } = req.body;

        const data = {};
        if (sku !== undefined) data.sku = sku.trim();
        if (descripcionVariante !== undefined) data.descripcionVariante = descripcionVariante?.trim() || null;
        if (activo !== undefined) data.activo = activo;

        const actualizado = await prisma.piezaSku.update({
            where: { id },
            data
        });

        res.json(actualizado);
    } catch (error) {
        console.error('Error en actualizarSku:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El SKU ya está registrado' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'SKU no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al actualizar el SKU' });
    }
};

const eliminarSku = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.piezaSku.delete({ where: { id } });
        res.json({ mensaje: 'SKU eliminado correctamente' });
    } catch (error) {
        console.error('Error en eliminarSku:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'SKU no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al eliminar el SKU' });
    }
};

module.exports = { obtenerSkusPorPieza, crearSku, actualizarSku, eliminarSku };
