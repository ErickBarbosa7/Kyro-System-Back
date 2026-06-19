const prisma = require('../db');

// POST: Crear Pieza (La Receta Maestra)
const crearPieza = async (req, res) => {
    try {
        // Extraemos los arreglos de la receta y los datos de la pieza base
        const { skus, metales, materiales, acabados, manoObra, ...datosPieza } = req.body;

        if (!datosPieza.estado) datosPieza.estado = 'ACTIVO';

        // Iniciamos la transacción interactiva ("tx" es la versión transaccional de "prisma")
        const resultado = await prisma.$transaction(async (tx) => {
            
            // 1. Guardar la pieza principal
            const nuevaPieza = await tx.pieza.create({
                data: datosPieza
            });

            // 2. Guardar los Códigos SKU
            if (skus && skus.length > 0) {
                // skus es un arreglo de strings ej: ["ANL-001-A", "ANL-001-B"]
                await tx.piezaSku.createMany({
                    data: skus.map(codigo => ({ piezaId: nuevaPieza.id, sku: codigo }))
                });
            }

            // 3. Guardar y calcular Metales
            for (const item of metales) {
                // Buscamos el precio actual del metal
                const metalDb = await tx.metal.findUnique({ where: { id: item.metalId } });
                if (!metalDb) throw new Error(`El metal con ID ${item.metalId} no existe`);

                const subtotal = Number(item.pesoUtilizadoGr) * Number(metalDb.precioPorGramo);

                await tx.costeoMetal.create({
                    data: {
                        piezaId: nuevaPieza.id,
                        metalId: item.metalId,
                        pesoUtilizadoGr: item.pesoUtilizadoGr,
                        precioGramoSnapshot: metalDb.precioPorGramo, // Congelamos el precio
                        subtotal: subtotal
                    }
                });
            }

            // 4. Guardar y calcular Materiales (Gemas)
            for (const item of materiales) {
                const materialDb = await tx.material.findUnique({ where: { id: item.materialId } });
                if (!materialDb) throw new Error(`El material con ID ${item.materialId} no existe`);

                const subtotal = Number(item.cantidadUtilizada) * Number(materialDb.costoUnitario);

                await tx.costeoMaterial.create({
                    data: {
                        piezaId: nuevaPieza.id,
                        materialId: item.materialId,
                        cantidadUtilizada: item.cantidadUtilizada,
                        costoUnitarioSnapshot: materialDb.costoUnitario, // Congelamos el precio
                        subtotal: subtotal
                    }
                });
            }

            // 5. (antes de Mano Obra) Guardar y calcular Acabados
            for (const item of acabados || []) {
                const acabadoDb = await tx.acabado.findUnique({ where: { id: item.acabadoId } });
                if (!acabadoDb) throw new Error(`El acabado con ID ${item.acabadoId} no existe`);

                const subtotal = Number(item.cantidad) * Number(acabadoDb.costoBase);

                await tx.costeoAcabado.create({
                    data: {
                        piezaId: nuevaPieza.id,
                        acabadoId: item.acabadoId,
                        cantidad: item.cantidad,
                        costoUnitarioSnapshot: acabadoDb.costoBase,
                        subtotal: subtotal
                    }
                });
            }

            // 6. Guardar Mano de Obra
            for (const item of manoObra || []) {
                const subtotal = Number(item.tiempoHrs) * Number(item.costoPorHora);
                
                await tx.costeoManoObra.create({
                    data: {
                        piezaId: nuevaPieza.id,
                        actividad: item.actividad,
                        tiempoHrs: item.tiempoHrs,
                        costoPorHora: item.costoPorHora,
                        subtotal: subtotal
                    }
                });
            }

            return nuevaPieza;
        });

        // Si la transacción termina sin lanzar errores, todo se guardó perfectamente
        res.status(201).json({ 
            mensaje: 'Pieza y receta de costeo creadas exitosamente', 
            piezaId: resultado.id 
        });

    } catch (error) {
        console.error("Error en la transacción de Pieza:", error);
        // Si el error fue lanzado por nosotros (ej. "El metal no existe")
        if (error.message.includes('no existe')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'La clave de la pieza o un SKU ya están registrados' });
        }
        res.status(500).json({ error: 'Error interno al procesar la receta de la pieza' });
    }
};
// GET: Obtener todas las piezas (Soporta papelera)
const obtenerPiezas = async (req, res) => {
    try {
        const { estado } = req.query;

        let filtro = { estado: 'ACTIVO' };

        if (estado === 'inactivos') {
            filtro = { estado: 'DESCONTINUADO' };
        } else if (estado === 'todos') {
            filtro = {};
        }

        const piezas = await prisma.pieza.findMany({
            where: filtro,
            include: {
                tipo: { select: { nombre: true } },
                coleccion: { select: { nombre: true } }
            },
            orderBy: { fechaCreacion: 'desc' }
        });
        res.json(piezas);
    } catch (error) {
        console.error("Error en obtenerPiezas:", error);
        res.status(500).json({ error: 'Error interno al obtener las piezas' });
    }
};

// GET: Obtener una pieza por ID (Con toda su receta de costeo)
const obtenerPiezaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pieza = await prisma.pieza.findUnique({
            where: { id },
            include: {
                tipo: true,
                coleccion: true,
                skus: true,
                costeoMetales: { include: { metal: true } },
                costeoMateriales: { include: { material: true } },
                costeoAcabados: { include: { acabado: true } },
                costeoManoObra: true,
                costeoGastosAplicados: true
            }
        });

        if (!pieza) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }

        res.json(pieza);
    } catch (error) {
        console.error("Error en obtenerPiezaPorId:", error);
        res.status(500).json({ error: 'Error interno al obtener la pieza' });
    }
};

// PUT: Actualizar datos generales de la pieza (Cabecera)
const actualizarPieza = async (req, res) => {
    try {
        const { id } = req.params;
        const datosPieza = req.body;

        // Ojo: Esto actualiza solo los datos base (nombre, clave, estado, etc.)
        // Actualizar la "receta" (metales/materiales) suele requerir endpoints específicos 
        // o una lógica de borrado y re-inserción para mantener el historial limpio.
        const piezaActualizada = await prisma.pieza.update({
            where: { id },
            data: datosPieza
        });

        res.json(piezaActualizada);
    } catch (error) {
        console.error("Error en actualizarPieza:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'La clave de la pieza ya está en uso' });
        }
        res.status(500).json({ error: 'Error interno al actualizar la pieza' });
    }
};

// DELETE: Baja lógica (Cambiar estado a DESCONTINUADO)
const eliminarPieza = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.pieza.update({
            where: { id },
            data: { estado: 'DESCONTINUADO' } // Usamos el Enum de tu schema
        });

        res.json({ mensaje: 'Pieza descontinuada correctamente' });
    } catch (error) {
        console.error("Error en eliminarPieza:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        res.status(500).json({ error: 'Error interno al eliminar la pieza' });
    }
};

// PUT: Reactivar Pieza (Volver a ACTIVO)
const reactivarPieza = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.pieza.update({
            where: { id },
            data: { estado: 'ACTIVO' }
        });

        res.json({ mensaje: 'Pieza reactivada correctamente' });
    } catch (error) {
        console.error("Error en reactivarPieza:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }
        res.status(500).json({ error: 'Error interno al reactivar la pieza' });
    }
};

// PUT: Actualizar pieza completa (cabecera + receta)
const actualizarPiezaCompleta = async (req, res) => {
    try {
        const { id } = req.params;
        const { metales, materiales, acabados, manoObra, ...datosPieza } = req.body;

        const resultado = await prisma.$transaction(async (tx) => {
            // 1. Actualizar cabecera de la pieza
            const piezaActualizada = await tx.pieza.update({
                where: { id },
                data: datosPieza
            });

            // 2. Eliminar costeo anterior
            await tx.costeoMetal.deleteMany({ where: { piezaId: id } });
            await tx.costeoMaterial.deleteMany({ where: { piezaId: id } });
            await tx.costeoAcabado.deleteMany({ where: { piezaId: id } });
            await tx.costeoManoObra.deleteMany({ where: { piezaId: id } });

            // 3. Re-crear metales
            for (const item of metales || []) {
                const metalDb = await tx.metal.findUnique({ where: { id: item.metalId } });
                if (!metalDb) throw new Error(`Metal ${item.metalId} no existe`);
                const subtotal = Number(item.pesoUtilizadoGr) * Number(metalDb.precioPorGramo);
                await tx.costeoMetal.create({
                    data: { piezaId: id, metalId: item.metalId, pesoUtilizadoGr: item.pesoUtilizadoGr, precioGramoSnapshot: metalDb.precioPorGramo, subtotal }
                });
            }

            // 4. Re-crear materiales
            for (const item of materiales || []) {
                const materialDb = await tx.material.findUnique({ where: { id: item.materialId } });
                if (!materialDb) throw new Error(`Material ${item.materialId} no existe`);
                const subtotal = Number(item.cantidadUtilizada) * Number(materialDb.costoUnitario);
                await tx.costeoMaterial.create({
                    data: { piezaId: id, materialId: item.materialId, cantidadUtilizada: item.cantidadUtilizada, costoUnitarioSnapshot: materialDb.costoUnitario, subtotal }
                });
            }

            // 5. Re-crear acabados
            for (const item of acabados || []) {
                const acabadoDb = await tx.acabado.findUnique({ where: { id: item.acabadoId } });
                if (!acabadoDb) throw new Error(`Acabado ${item.acabadoId} no existe`);
                const subtotal = Number(item.cantidad) * Number(acabadoDb.costoBase);
                await tx.costeoAcabado.create({
                    data: { piezaId: id, acabadoId: item.acabadoId, cantidad: item.cantidad, costoUnitarioSnapshot: acabadoDb.costoBase, subtotal }
                });
            }

            // 6. Re-crear mano de obra
            for (const item of manoObra || []) {
                const subtotal = Number(item.tiempoHrs) * Number(item.costoPorHora);
                await tx.costeoManoObra.create({
                    data: { piezaId: id, actividad: item.actividad, tiempoHrs: item.tiempoHrs, costoPorHora: item.costoPorHora, subtotal }
                });
            }

            return piezaActualizada;
        });

        res.json({ mensaje: 'Pieza y receta actualizadas exitosamente', piezaId: resultado.id });
    } catch (error) {
        console.error("Error en actualizarPiezaCompleta:", error);
        if (error.message.includes('no existe')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error interno al actualizar la receta de la pieza' });
    }
};

module.exports = { crearPieza, obtenerPiezas, obtenerPiezaPorId, actualizarPieza, eliminarPieza, reactivarPieza, actualizarPiezaCompleta };