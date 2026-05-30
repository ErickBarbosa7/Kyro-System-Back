const { z } = require('zod');

const crearTipoPiezaSchema = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    codigo: z.string().min(2, "El código debe tener al menos 2 caracteres").toUpperCase(), // Forzamos mayúsculas
});

module.exports = { crearTipoPiezaSchema };