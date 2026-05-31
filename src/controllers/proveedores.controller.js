const prisma = require('../db');

// POST: Crear Proveedor
const crearProveedor = async (req, res) => {
    try {
        const data = req.body;
        const nuevoProveedor = await prisma.proveedor.create({ data });
        res.status(201).json(nuevoProveedor);
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ error: 'Error interno al registrar el proveedor' });
    }
};

// GET: Obtener todos los Proveedores activos
const obtenerProveedores = async (req, res) => {
    try {
        // Leemos el estado desde la URL (ej. ?estado=inactivos)
        const { estado } = req.query; 
        
        let filtroActivo = {};
        if (estado === 'activos') filtroActivo = { activo: true };
        else if (estado === 'inactivos') filtroActivo = { activo: false };
        // Si es 'todos', filtroActivo se queda vacío y Prisma trae todo

        const proveedores = await prisma.proveedor.findMany({
            where: filtroActivo,
            orderBy: { nombre: 'asc' }
        });
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
};

// PUT: Actualizar Proveedor
const actualizarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const proveedorActualizado = await prisma.proveedor.update({
            where: { id },
            data
        });
        
        res.json(proveedorActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar el proveedor' });
    }
};

// DELETE: Eliminar Proveedor (Baja Lógica)
const eliminarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.proveedor.update({
            where: { id },
            data: { activo: false }
        });
        
        res.json({ mensaje: 'Proveedor eliminado correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.status(500).json({ error: 'Error interno al eliminar el proveedor' });
    }
};

module.exports = { 
    crearProveedor, 
    obtenerProveedores, 
    actualizarProveedor, 
    eliminarProveedor 
};