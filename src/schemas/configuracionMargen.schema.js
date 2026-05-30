const { z } = require('zod');

const crearConfiguracionMargenSchema = z.object({
    nombre: z.string().min(2, "El nombre de la configuración es obligatorio (ej. Márgenes 2026)"),
    margenTaller: z.coerce.number().min(0, "El margen no puede ser negativo"),
    margenMayorista: z.coerce.number().min(0, "El margen no puede ser negativo"),
    margenPublico: z.coerce.number().min(0, "El margen no puede ser negativo"),
    descuentoMaximo: z.coerce.number().min(0).optional()
});

module.exports = { crearConfiguracionMargenSchema };