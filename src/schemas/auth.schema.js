const { z } = require('zod');

const registroSchema = z.object({
    nombre: z.string({
        required_error: "El nombre es obligatorio"
    }).min(2, "El nombre debe tener al menos 2 caracteres"),

    // El apellido está perfecto así, permite que sea opcional o que venga vacío
    apellido: z.string().optional().or(z.literal('')),

    email: z.string({
        required_error: "El email es obligatorio"
    }).email("El formato del correo es inválido"),

    password: z.string({
        required_error: "La contraseña es obligatoria"
    }).min(6, "La contraseña debe tener al menos 6 caracteres")

});

const loginSchema = z.object({
    email: z.string({
        required_error: "El email es obligatorio"
    }).email("El formato del correo es inválido"),
    
    password: z.string({
        required_error: "La contraseña es obligatoria"
    }).min(1, "La contraseña no puede estar vacía")
});

module.exports = { registroSchema, loginSchema };