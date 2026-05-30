const { z } = require('zod');

// 1. Esquema para los Metales (Receta)
const costeoMetalSchema = z.object({
    metalId: z.string().uuid("ID de metal inválido"),
    pesoUtilizadoGr: z.coerce.number().positive("El peso del metal debe ser mayor a 0")
});

// 2. Esquema para los Materiales/Gemas (Receta)
const costeoMaterialSchema = z.object({
    materialId: z.string().uuid("ID de material inválido"),
    cantidadUtilizada: z.coerce.number().positive("La cantidad de material debe ser mayor a 0")
});

// 3. Esquema para los Acabados (Receta)
const costeoAcabadoSchema = z.object({
    acabadoId: z.string().uuid("ID de acabado inválido"),
    cantidad: z.coerce.number().positive("La cantidad del acabado debe ser mayor a 0")
});

// 4. Esquema para la Mano de Obra (Receta)
const costeoManoObraSchema = z.object({
    actividad: z.string().min(2, "Describe la actividad (ej. Fundición y Engarce)"),
    tiempoHrs: z.coerce.number().positive("El tiempo debe ser mayor a 0"),
    costoPorHora: z.coerce.number().positive("El costo por hora debe ser mayor a 0")
});

// ==========================================
// EL ESQUEMA PRINCIPAL (EL JSON MASIVO)
// ==========================================
const EstadoPiezaEnum = z.enum(['ACTIVO', 'BORRADOR', 'DESCONTINUADO']);

const crearPiezaSchema = z.object({
    // Datos Generales
    tipoId: z.string().uuid("ID de tipo de pieza inválido"),
    coleccionId: z.string().uuid("ID de colección inválido"),
    clave: z.string().min(2, "La clave es obligatoria (ej. ANL-PR26-001)"),
    nombreComercial: z.string().min(2, "El nombre comercial es obligatorio"),
    estado: EstadoPiezaEnum,
    descripcion: z.string().optional().or(z.literal('')),
    imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),

    // La Receta (Arreglos de los sub-esquemas)
    metales: z.array(costeoMetalSchema).min(1, "La pieza debe tener al menos un metal base"),
    materiales: z.array(costeoMaterialSchema).optional().default([]),
    acabados: z.array(costeoAcabadoSchema).optional().default([]),
    manoObra: z.array(costeoManoObraSchema).min(1, "Debes registrar al menos un costo de mano de obra"),
    
    // Los códigos de variante generados
    skus: z.array(z.string()).min(1, "Debes incluir al menos un SKU para la pieza")
});

module.exports = { crearPiezaSchema };