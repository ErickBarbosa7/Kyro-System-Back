const { z } = require('zod');

const crearMaterialSchema = z.object({
    // Opcional pero si viene debe ser un UUID válido
    proveedorId: z.string().uuid("El ID del proveedor es inválido").optional().or(z.literal('')),
    
    nombre: z.string().min(2, "El nombre es obligatorio"),
    categoriaId: z.string().min(2, "La categoría es obligatoria (ej. Piedras, Hilos)"),
    descripcion: z.string().optional(),
    unidadCompra: z.string().min(1, "La unidad es obligatoria (ej. Gramos, Piezas)"),
    
    // Coerce.number() convierte strings a números automáticamente
    precioCompra: z.coerce.number().positive("El precio de compra debe ser mayor a 0"),
    cantidadComprada: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
    
    stockMinimo: z.coerce.number().nonnegative("El stock mínimo no puede ser negativo"),
    stockMaximo: z.coerce.number().optional(),
    
    imagenUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal(''))
});

module.exports = { crearMaterialSchema };