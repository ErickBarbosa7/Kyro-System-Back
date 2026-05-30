const { z } = require('zod');

const PeriodicidadEnum = z.enum(['SEMANAL', 'MENSUAL', 'ANUAL', 'UNICA'], {
    errorMap: () => ({ message: "La periodicidad debe ser SEMANAL, MENSUAL, ANUAL o UNICA" })
});

const crearGastoOperativoSchema = z.object({
    concepto: z.string().min(2, "El concepto es obligatorio (ej. Renta Local)"),
    categoria: z.string().min(2, "La categoría es obligatoria (ej. Servicios, Nómina)"),
    
    // Convertimos el monto a número exacto
    monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
    
    periodicidad: PeriodicidadEnum,
    
    // coerce.date() transforma un string (ej. "2026-06-01") a un objeto Date real
    fecha: z.coerce.date({
        errorMap: () => ({ message: "La fecha es inválida o tiene un formato incorrecto" })
    }),
    
    observaciones: z.string().optional().or(z.literal(''))
});

module.exports = { crearGastoOperativoSchema };