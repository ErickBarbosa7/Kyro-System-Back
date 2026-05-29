const validarEsquema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        // 1. Verificamos si es un error de validación de Zod
        if (error.errors) {
            return res.status(400).json({
                error: "Datos de entrada inválidos",
                detalles: error.errors.map(err => err.message)
            });
        }
        
        // 2. Si es un error de código (ej. el esquema no se importó bien)
        console.error("Error interno en el Middleware de Validación:", error.message);
        return res.status(500).json({
            error: "Error interno en el servidor al validar los datos",
            detalles: [error.message]
        });
    }
};

module.exports = { validarEsquema };