const { z } = require('zod');

const crearProveedorSchema = z.object({
    // Obligatorio
    nombre: z.string({
        required_error: "El nombre del proveedor es obligatorio"
    }).min(2, "El nombre debe tener al menos 2 caracteres"),

    // Opcionales
    domicilio: z.string().optional(),
    telefonos: z.array(
        z.string().regex(/^\+?[0-9\s]+$/, "El teléfono solo puede contener números, espacios o el signo +")
    )
    .max(3, "No puedes agregar más de 3 teléfonos")
    .optional(), 

    // Validamos que si mandan email, sea un correo real
    emails: z.array(
        z.string().email("El formato del correo es inválido")
    )
    .max(3, "No puedes agregar más de 3 correos")
    .optional(),

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