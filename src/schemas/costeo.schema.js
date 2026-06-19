const { z } = require('zod');

const costeoMetalSchema = z.object({
    metalId: z.string().uuid("ID de metal inválido"),
    pesoUtilizadoGr: z.coerce.number().positive("El peso del metal debe ser mayor a 0")
});

const costeoMaterialSchema = z.object({
    materialId: z.string().uuid("ID de material inválido"),
    cantidadUtilizada: z.coerce.number().positive("La cantidad de material debe ser mayor a 0")
});

const costeoAcabadoSchema = z.object({
    acabadoId: z.string().uuid("ID de acabado inválido"),
    cantidad: z.coerce.number().positive("La cantidad del acabado debe ser mayor a 0")
});

const costeoManoObraSchema = z.object({
    actividad: z.string().min(2, "Describe la actividad (ej. Fundición y Engarce)"),
    tiempoHrs: z.coerce.number().positive("El tiempo debe ser mayor a 0"),
    costoPorHora: z.coerce.number().positive("El costo por hora debe ser mayor a 0")
});

const costeoGastoSchema = z.object({
    gastoId: z.string().uuid("ID de gasto inválido"),
    importeAplicado: z.coerce.number().nonnegative("El importe aplicado no puede ser negativo")
});

module.exports = {
    costeoMetalSchema,
    costeoMaterialSchema,
    costeoAcabadoSchema,
    costeoManoObraSchema,
    costeoGastoSchema
};
