require('dotenv').config();
const prisma = require('../db');

// GET: Listar colecciones filtradas por estado
const obtenerColecciones = async (req, res) => {
    try {
        const { estado } = req.query;
        let filtro = {};

        // Configuramos el filtro según lo que pida el frontend
        if (estado === 'inactivos') {
            filtro = { activa: false };
        } else if (estado === 'todos') {
            filtro = {}; // Sin filtro, trae todo
        } else {
            filtro = { activa: true }; // Comportamiento por defecto
        }

        const colecciones = await prisma.coleccion.findMany({
            where: filtro,
            orderBy: { nombre: 'asc' }
        });
        res.json(colecciones);
    } catch (error) {
        console.error('obtenerColecciones err:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// GET: Obtener registro específico por ID
const obtenerColeccionPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const coleccion = await prisma.coleccion.findUnique({
            where: { id }
        });

        if (!coleccion || !coleccion.activa) {
            return res.status(404).json({ error: 'Colección no encontrada' });
        }

        res.json(coleccion);
    } catch (error) {
        console.error('obtenerColeccionPorId err:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// POST: Crear nuevo registro
const crearColeccion = async (req, res) => {
    try {
        const { nombre, codigo, descripcion } = req.body;
        
        if (!nombre || !codigo) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevaColeccion = await prisma.coleccion.create({
            data: { nombre, codigo, descripcion }
        });
        
        res.status(201).json(nuevaColeccion);
    } catch (error) {
        console.error('crearColeccion err:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El código de colección ya está en uso' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// PUT: Actualizar registro existente
const actualizarColeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, descripcion } = req.body;

        const coleccionActualizada = await prisma.coleccion.update({
            where: { id },
            data: { nombre, codigo, descripcion }
        });

        res.json(coleccionActualizada);
    } catch (error) {
        console.error('actualizarColeccion err:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Colección no encontrada' });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'El código de colección ya está en uso' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// DELETE: Baja lógica (Soft-delete, no elimina el registro lo desactiva)
const eliminarColeccion = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.coleccion.update({
            where: { id },
            data: { activa: false }
        });

        res.json({ message: 'Colección eliminada correctamente' });
    } catch (error) {
        console.error('eliminarColeccion err:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Colección no encontrada' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// PUT/PATCH: Reactivar un registro (sacar de la papelera)
const reactivarColeccion = async (req, res) => {
    try {
        const { id } = req.params;

        const coleccionReactivada = await prisma.coleccion.update({
            where: { id },
            data: { activa: true }
        });

        res.json({ message: 'Colección restaurada correctamente', coleccion: coleccionReactivada });
    } catch (error) {
        console.error('reactivarColeccion err:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Colección no encontrada' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerColecciones,
    obtenerColeccionPorId,
    crearColeccion,
    actualizarColeccion,
    eliminarColeccion,
    reactivarColeccion
};