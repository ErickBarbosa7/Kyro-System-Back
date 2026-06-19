const prisma = require('../db');
const cloudinary = require('cloudinary').v2; 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Helper para subir el buffer de memoria a Cloudinary usando Streams
const subirACloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'erp-joyeria/materiales',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// POST: Crear material 
const crearMaterial = async (req, res) => {
    try {
        const data = req.body;

        const precioCompra = Number(data.precioCompra);
        const cantidadComprada = Number(data.cantidadComprada);
        const stockMinimo = data.stockMinimo ? Number(data.stockMinimo) : 0;
        const stockMaximo = (data.stockMaximo === null || data.stockMaximo === '') 
            ? null 
            : (data.stockMaximo !== undefined ? Number(data.stockMaximo) : null);

        if (data.proveedorId && data.proveedorId.trim() !== '') {
            const proveedorExiste = await prisma.proveedor.findUnique({
                where: { id: data.proveedorId }
            });
            if (!proveedorExiste) {
                return res.status(404).json({ error: 'El proveedor asignado no existe' });
            }
        }

        let imagenUrl = undefined;
        if (req.file) {
            imagenUrl = await subirACloudinary(req.file.buffer);
        }

        // LÓGICA MATEMÁTICA PROTEGIDA (Previene Infinity y Decimales infinitos)
        const cantidadSegura = cantidadComprada > 0 ? cantidadComprada : 1; 
        const costoUnitario = Number((precioCompra / cantidadSegura).toFixed(4));
        const stockDisponible = cantidadComprada;

        const dataToSave = {
            nombre: data.nombre,
            categoriaId: data.categoria || data.categoriaId, 
            descripcion: data.descripcion || undefined,
            observaciones: data.observaciones || undefined,
            imagenUrl: imagenUrl, 
            unidadMedidaId: data.unidadMedidaId, 
            precioCompra,
            cantidadComprada,
            stockMinimo,
            stockMaximo,
            costoUnitario,
            stockDisponible,
            fechaCompra: new Date()
        };

        if (data.proveedorId && data.proveedorId.trim() !== '') {
            dataToSave.proveedorId = data.proveedorId;
        }

        const nuevoMaterial = await prisma.material.create({
            data: dataToSave,
            include: {
                proveedor: { select: { nombre: true } },
                unidadMedida: { select: { nombre: true } }
            }
        });

        res.status(201).json(nuevoMaterial);
    } catch (error) {
        console.error('Error en crearMaterial:', error);
        res.status(500).json({ error: 'Error interno al registrar el material' });
    }
};

/// GET Obtener todos los materiales (Soporta la papelera)
const obtenerMateriales = async (req, res) => {
    try {
        const { estado } = req.query; 
        
        let filtro = { activo: true }; 

        if (estado === 'inactivos') {
            filtro = { activo: false }; 
        } else if (estado === 'todos') {
            filtro = {}; 
        }

        const materiales = await prisma.material.findMany({
            where: filtro,
            include: {
                proveedor: {
                    select: {
                        nombre: true,
                        telefonos: true,
                    }
                },
                unidadMedida: {
                    select: {
                        nombre: true
                    }
                },
                categoria: {
                    select: {
                        nombre: true
                    }
                }
            },
            orderBy: {
                nombre: "asc"
            }
        });
        res.json(materiales);
    } catch (error) {
        console.error('Error en obtenerMateriales:', error);
        res.status(500).json({ error: 'Error interno al obtener los materiales' });
    }
};

// PUT: Reactivar material (Sacar de la papelera)
const reactivarMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.material.update({
            where: { id },
            data: { activo: true }
        });

        res.json({ mensaje: 'Material reactivado correctamente' });
    } catch (error) {
        console.error('Error en reactivarMaterial:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al reactivar el material' });
    }
};

// GET Obtener material por ID
const obtenerMaterialPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await prisma.material.findUnique({
            where: { id },
            include: {
                proveedor: { select: { nombre: true, email: true } },
                unidadMedida: { select: { nombre: true } },
                categoria: { select: { nombre: true } }
            }
        });

        if (!material || !material.activo) {
            return res.status(404).json({ error: 'Material no encontrado o inactivo' });
        }

        res.json(material);
    } catch (error) {
        console.error('Error en obtenerMaterialPorId:', error);
        res.status(500).json({ error: 'Error interno al obtener el material' });
    }
};

// PUT: Actualizar material
const actualizarMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const materialActual = await prisma.material.findUnique({ where: { id } });
        if (!materialActual) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }

        if (data.proveedorId && data.proveedorId.trim() !== '' && data.proveedorId !== materialActual.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({
                where: { id: data.proveedorId }
            });
            if (!proveedorExiste) {
                return res.status(404).json({ error: 'El nuevo proveedor asignado no existe' });
            }
        }

        let nuevaImagenUrl = materialActual.imagenUrl;
        if (req.file) {
            nuevaImagenUrl = await subirACloudinary(req.file.buffer);
        }

        let stockMaximo = materialActual.stockMaximo; 
        if (data.stockMaximo === null || data.stockMaximo === '') {
            stockMaximo = null; 
        } else if (data.stockMaximo !== undefined) {
            stockMaximo = Number(data.stockMaximo); 
        }

        const precioCompra = data.precioCompra !== undefined && data.precioCompra !== '' ? Number(data.precioCompra) : materialActual.precioCompra;
        const cantidadComprada = data.cantidadComprada !== undefined && data.cantidadComprada !== '' ? Number(data.cantidadComprada) : materialActual.cantidadComprada;
        const stockMinimo = data.stockMinimo !== undefined && data.stockMinimo !== '' ? Number(data.stockMinimo) : materialActual.stockMinimo;

        // LÓGICA MATEMÁTICA PROTEGIDA (Previene Infinity y Decimales infinitos)
        const cantidadSegura = cantidadComprada > 0 ? cantidadComprada : 1;
        const nuevoCostoUnitario = Number((precioCompra / cantidadSegura).toFixed(4));

        const updateData = {
            nombre: data.nombre || materialActual.nombre,
            categoriaId: data.categoriaId || materialActual.categoriaId,
            unidadMedidaId: data.unidadMedidaId || materialActual.unidadMedidaId,
            proveedorId: (data.proveedorId && data.proveedorId.trim() !== '') ? data.proveedorId : null,
            descripcion: data.descripcion !== undefined ? data.descripcion : materialActual.descripcion,
            observaciones: data.observaciones !== undefined ? data.observaciones : materialActual.observaciones,
            precioCompra,
            cantidadComprada,
            stockMinimo,
            stockMaximo,
            costoUnitario: nuevoCostoUnitario,
            imagenUrl: nuevaImagenUrl
        };

        const materialActualizado = await prisma.material.update({
            where: { id },
            data: updateData,
            include: {
                proveedor: { select: { nombre: true } },
                unidadMedida: { select: { nombre: true } } 
            }
        });

        res.json(materialActualizado);
    } catch (error) {
        console.error('Error en actualizarMaterial:', error);
        res.status(500).json({ error: 'Error interno al actualizar el material' });
    }
};

// DELETE: Eliminar material, soft-delete
const eliminarMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.material.update({
            where: { id },
            data: { activo: false }
        });

        res.json({ mensaje: 'Material eliminado correctamente del catálogo' });
    } catch (error) {
        console.error('Error en eliminarMaterial:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        res.status(500).json({ error: 'Error interno al eliminar el material' });
    }
};

module.exports = {
    crearMaterial,
    obtenerMateriales,
    obtenerMaterialPorId,
    actualizarMaterial,
    eliminarMaterial,
    reactivarMaterial
};