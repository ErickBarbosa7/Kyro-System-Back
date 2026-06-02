const prisma = require('../db');

// POST: Crear material 
const crearMaterial = async (req, res) => {
    try {
        const data = req.body;

        // Validar que el proveedor exista (si se envió uno)
        if (data.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({
                where: { id: data.proveedorId }
            });
            if (!proveedorExiste) {
                return res.status(404).json({ error: 'El proveedor asignado no existe' });
            }
        }

        // Lógica Matemática Financiera
        const costoUnitario = data.precioCompra / data.cantidadComprada;
        const stockDisponible = data.cantidadComprada;

        // 1. Armamos el objeto limpio con exactamente los nombres que pide el schema
        const dataToSave = {
            nombre: data.nombre,
            categoriaId: data.categoria || data.categoriaId, 
            descripcion: data.descripcion || undefined,
            imagenUrl: data.imagenUrl || undefined,
            // AHORA USAMOS EL ID DE LA UNIDAD DE MEDIDA
            unidadMedidaId: data.unidadMedidaId, 
            precioCompra: data.precioCompra,
            cantidadComprada: data.cantidadComprada,
            stockMinimo: data.stockMinimo,
            stockMaximo: data.stockMaximo || undefined,
            costoUnitario,
            stockDisponible,
            fechaCompra: new Date()
        };

        // 2. Solo inyectamos el proveedorId si realmente existe (evitamos el 'null' explícito)
        if (data.proveedorId) {
            dataToSave.proveedorId = data.proveedorId;
        }

        const nuevoMaterial = await prisma.material.create({
            data: dataToSave,
            include: {
                proveedor: { select: { nombre: true } },
                // AÑADIMOS LA UNIDAD DE MEDIDA EN LA RESPUESTA
                unidadMedida: { select: { nombre: true } }
            }
        });

        res.status(201).json(nuevoMaterial);
    } catch (error) {
        console.error('Error en crearMaterial:', error);
        res.status(500).json({ error: 'Error interno al registrar el material' });
    }
};

/// GET Obtener todos los materiales (Ahora soporta la papelera)
const obtenerMateriales = async (req, res) => {
    try {
        const { estado } = req.query; // Leemos lo que manda React
        
        let filtro = { activo: true }; // Por defecto, solo activos

        if (estado === 'inactivos') {
            filtro = { activo: false }; // Papelera
        } else if (estado === 'todos') {
            filtro = {}; // Todos
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
                // INCLUIMOS LA UNIDAD PARA MOSTRARLA EN LA TABLA
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
                // AÑADIMOS LA UNIDAD
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

        // 1. Verificar si el material existe
        const materialActual = await prisma.material.findUnique({ where: { id } });
        if (!materialActual || !materialActual.activo) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }

        // 2. Verificar el proveedor si lo están intentando cambiar
        if (data.proveedorId && data.proveedorId !== materialActual.proveedorId) {
            const proveedorExiste = await prisma.proveedor.findUnique({
                where: { id: data.proveedorId }
            });
            if (!proveedorExiste) {
                return res.status(404).json({ error: 'El nuevo proveedor asignado no existe' });
            }
        }

        // 3. Recalcular costo unitario SOLO SI se modificaron el precio o la cantidad original
        let nuevoCostoUnitario = materialActual.costoUnitario;
        if (data.precioCompra !== undefined && data.cantidadComprada !== undefined) {
            nuevoCostoUnitario = data.precioCompra / data.cantidadComprada;
        }

        const updateData = { ...data, costoUnitario: nuevoCostoUnitario };
        delete updateData.unidadCompra; // Nos aseguramos de no mandar el campo viejo a Prisma

        const materialActualizado = await prisma.material.update({
            where: { id },
            data: updateData,
            include: {
                proveedor: { select: { nombre: true } },
                unidadMedida: { select: { nombre: true } } // Retornamos la unidad actualizada
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