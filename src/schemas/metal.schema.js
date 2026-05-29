const { z } = require('zod');

const crearMetalSchema = z.object({
    proveedorId: z.string().uuid("ID de proveedor inválido").optional().or(z.literal('')),
    nombre: z.string().min(2, "El nombre del metal es obligatorio"),
    precioPorGramo: z.coerce.number().positive("El precio por gramo debe ser mayor a 0"),
    stockDisponible: z.coerce.number().nonnegative("El stock no puede ser negativo"),
    stockMinimo: z.coerce.number().nonnegative("El stock mínimo no puede ser negativo"),
    
    observaciones: z.string().optional().or(z.literal(''))
});

module.exports = { crearMetalSchema };