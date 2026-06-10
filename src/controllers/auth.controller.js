require('dotenv').config();
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario (Administrador por defecto o Auto-creado)
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Buscar el rol Administrador
        let rolAdmin = await prisma.rol.findFirst({
            where: { nombre: 'Administrador' }
        });

        // Si la base de datos es nueva y el rol no existe, lo creamos automáticamente
        if (!rolAdmin) {
            rolAdmin = await prisma.rol.create({
                data: {
                    nombre: 'Administrador'
                    // Si tu schema tiene una descripción obligatoria para Rol, descomenta la siguiente línea:
                    // , descripcion: 'Acceso total al sistema'
                }
            });
        }

        // Encriptar la contraseña (Hash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el usuario en la BD
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                email,
                password: hashedPassword,
                rolId: rolAdmin.id 
            },
            include: {
                rol: true
            }
        });

        // Retornar datos sin la contraseña por seguridad
        res.status(201).json({ 
            id: nuevoUsuario.id, 
            nombre: nuevoUsuario.nombre, 
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol 
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Login/Iniciar Sesion (Generación del JWT)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: {
                rol: true
            }
        });

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                error: 'Credenciales inválidas o usuario inactivo'
            });
        }

        const passwordValido = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                rol: usuario.rol.nombre
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido, // También lo enviamos en el login por si lo ocupas en el navbar
                email: usuario.email,
                rol: usuario.rol.nombre
            }
        });

    } catch (error) {
        console.error('Error en login:', error);

        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};
// Actualizar perfil de usuario
const actualizarPerfil = async (req, res) => {
    try {
        // El ID debe venir del token validado por tu middleware (req.usuario)
        const usuarioId = req.usuario.id; 
        
        // Ya no recibimos email, recibimos passwordAnterior
        const { nombre, apellido, passwordAnterior, passwordNuevo } = req.body;

        // Validaciones básicas
        if (nombre !== undefined && nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre no puede estar vacío' });
        }

        // Construir dinámicamente el objeto con los datos a actualizar
        const dataActualizacion = {};
        if (nombre) dataActualizacion.nombre = nombre;
        if (apellido !== undefined) dataActualizacion.apellido = apellido;

        // Lógica de contraseña segura
        if (passwordNuevo) {
            if (!passwordAnterior) {
                return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual para realizar este cambio' });
            }

            // Validación de longitud para la nueva contraseña
            if (passwordNuevo.length < 8) {
                return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
            }

            // 1. Buscar al usuario para obtener su contraseña actual encriptada
            const usuarioBD = await prisma.usuario.findUnique({ where: { id: usuarioId } });
            
            // 2. Comparar la contraseña ingresada con la guardada
            const passwordValido = await bcrypt.compare(passwordAnterior, usuarioBD.password);
            
            if (!passwordValido) {
                return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
            }

            // 3. Si es válida, encriptamos la nueva
            const salt = await bcrypt.genSalt(10);
            dataActualizacion.password = await bcrypt.hash(passwordNuevo, salt);
        }

        // Actualizar en la BD
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: usuarioId },
            data: dataActualizacion,
            include: {
                rol: true
            }
        });

        // Retornar los datos actualizados, excluyendo siempre la contraseña
        res.json({
            mensaje: 'Perfil actualizado exitosamente',
            usuario: {
                id: usuarioActualizado.id,
                nombre: usuarioActualizado.nombre,
                apellido: usuarioActualizado.apellido,
                email: usuarioActualizado.email,
                rol: usuarioActualizado.rol.nombre
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil' });
    }
};

module.exports = { registrarUsuario, login,actualizarPerfil };