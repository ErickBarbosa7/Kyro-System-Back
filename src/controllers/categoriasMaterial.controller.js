const prisma = require('../db');

// POST: Crear Categoría (Lo que usará tu botón "+")
const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const nuevaCategoria = await prisma.categoriaMaterial.create({
            data: { nombre, descripcion }
        });

        res.status(201).json(nuevaCategoria);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        // P2002 es el código de Prisma para "Registro duplicado"
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe una categoría con este nombre' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// GET: Listar Categorías (Para llenar el menú desplegable)
const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await prisma.categoriaMaterial.findMany({
            where: { activa: true },
            orderBy: { nombre: 'asc' }
        });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// PUT: Actualizar Categoría
const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const categoriaActualizada = await prisma.categoriaMaterial.update({
            where: { id },
            data: { nombre, descripcion }
        });

        res.json(categoriaActualizada);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
        if (error.code === 'P2002') return res.status(400).json({ error: 'El nombre ya está en uso' });
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// DELETE: Eliminar Categoria(Soft-delete)
const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.categoriaMaterial.update({
            where: { id },
            data: { activa: false }
        });
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};

module.exports = {
    crearCategoria,
    obtenerCategorias,
    actualizarCategoria,
    eliminarCategoria
};