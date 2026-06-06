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

module.exports = { registrarUsuario, login };