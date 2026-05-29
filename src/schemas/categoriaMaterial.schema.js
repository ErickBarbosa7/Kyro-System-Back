const { z } = require('zod');

const categoriaMaterialSchema = z.object({
    nombre: z.string({
        required_error: "El nombre de la categoría es obligatorio"
    }).min(2, "El nombre debe tener al menos 2 caracteres"),
    
    descripcion: z.string().optional().or(z.literal(''))
});

module.exports = { categoriaMaterialSchema };