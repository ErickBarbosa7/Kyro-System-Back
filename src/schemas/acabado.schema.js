const { z } = require('zod');

// Definimos las opciones exactas que tienes en tu base de datos (Prisma)
const TipoCobroEnum = z.enum(['FIJO', 'POR_PIEZA', 'POR_GRAMO', 'POR_LOTE'], {
    errorMap: () => ({ message: "El tipo de cobro debe ser FIJO, POR_PIEZA, POR_GRAMO o POR_LOTE" })
});

const crearAcabadoSchema = z.object({
    proveedorId: z.string().uuid("ID de proveedor inválido").optional().or(z.literal('')),
    nombre: z.string().min(2, "El nombre del acabado es obligatorio"),
    descripcion: z.string().optional().or(z.literal('')),
    tipoCobro: TipoCobroEnum,
    
    // coerce.number() para evitar errores si el precio llega como string desde React
    costoBase: z.coerce.number().nonnegative("El costo base no puede ser negativo")
});

module.exports = { crearAcabadoSchema };