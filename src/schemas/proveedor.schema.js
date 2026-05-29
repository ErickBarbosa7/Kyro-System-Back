const { z } = require('zod');

const crearProveedorSchema = z.object({
    // Obligatorio
    nombre: z.string({
        required_error: "El nombre del proveedor es obligatorio"
    }).min(2, "El nombre debe tener al menos 2 caracteres"),

    // Opcionales
    domicilio: z.string().optional(),
    
    // Validamos que si mandan teléfono tenga sentido lógico
    telefono: z.string()
        .regex(/^\+?[0-9\s]+$/, "El teléfono solo puede contener números, espacios o el signo +")
        .min(10, "El teléfono debe tener al menos 10 caracteres")
        .max(20, "El teléfono es demasiado largo")
        .optional()
        .or(z.literal('')), 

    // Validamos que si mandan email, sea un correo real
    email: z.string()
        .email("El formato del correo es inválido")
        .optional()
        .or(z.literal('')),

    // Validamos que sea un link real
    paginaWeb: z.string()
        .url("Debe ser una URL válida (ej. https://kyro.com)")
        .optional()
        .or(z.literal('')),

    redesSociales: z.string().optional(),
    observaciones: z.string().optional()
});

const actualizarProveedorSchema = crearProveedorSchema.partial();

module.exports = { 
    crearProveedorSchema, 
    actualizarProveedorSchema 
};