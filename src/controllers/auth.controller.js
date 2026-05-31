require('dotenv').config();
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Registro de usuario (Solo para Admin)
// Registro de usuario (Administrador por defecto)
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const rolAdmin = await prisma.rol.findFirst({
            where: { nombre: 'Administrador' }
        });

        if (!rolAdmin) {
            return res.status(500).json({ 
                error: 'Error: No se encontró el rol "Administrador" en la base de datos. Asegúrate de crearlo primero.' 
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

        // Retornar datos sin la contraseña
        res.status(201).json({ 
            id: nuevoUsuario.id, 
            nombre: nuevoUsuario.nombre, 
            apellido: nuevoUsuario.apellido, // También podemos devolver el apellido
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

module.exports = { registrarUsuario, login };