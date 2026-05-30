const jwt = require('jsonwebtoken');

// Guardia 1: Verifica si traes el Gafete (Token válido)
const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // Inyectamos los datos del usuario en la petición
        next(); // Lo dejamos pasar al controlador
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Guardia 2: Verifica si tu Rol tiene permiso para esta acción
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !req.usuario.rol) {
            return res.status(403).json({ error: 'No tienes los permisos necesarios para realizar esta acción' });
        }

        // 1. Convertimos el rol que trae el token a mayúsculas
        const rolDelUsuario = req.usuario.rol.toUpperCase();

        // 2. Convertimos los roles que pide la ruta a mayúsculas
        const rolesValidos = rolesPermitidos.map(rol => rol.toUpperCase());

        // 3. Comparamos peras con peras (ej. 'ADMINISTRADOR' incluye a 'ADMINISTRADOR')
        if (!rolesValidos.includes(rolDelUsuario)) {
            return res.status(403).json({ error: 'No tienes los permisos necesarios para realizar esta acción' });
        }
        
        next(); // ¡Pase usted!
    };
};

module.exports = { verificarToken, verificarRol };