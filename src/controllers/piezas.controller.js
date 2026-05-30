const prisma = require('../db');

// POST: Crear Pieza (La Receta Maestra)
const crearPieza = async (req, res) => {
    try {
        // Extraemos los arreglos de la receta y los datos de la pieza base
        const { skus, metales, materiales, acabados, manoObra, ...datosPieza } = req.body;

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

            // 5. Guardar Mano de Obra
            for (const item of manoObra) {
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

            // (Omitimos Acabados por ahora para mantener el ejemplo claro, pero la lógica es idéntica)

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

module.exports = { crearPieza };