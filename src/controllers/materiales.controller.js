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
            // Usamos categoriaId que es como se llama en la base de datos
            categoriaId: data.categoria || data.categoriaId, 
            descripcion: data.descripcion || undefined,
            imagenUrl: data.imagenUrl || undefined,
            unidadCompra: data.unidadCompra,
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
                proveedor: { select: { nombre: true } }
            }
        });

        res.status(201).json(nuevoMaterial);
    } catch (error) {
        console.error('Error en crearMaterial:', error);
        res.status(500).json({ error: 'Error interno al registrar el material' });
    }
};

// GET Obtener todos los materiales
const obtenerMateriales = async (req, res) => {
    try {
        const materiales = await prisma.material.findMany({
            where: {
                activo: true
            },
            include: {
                proveedor: {
                    select: {
                        nombre: true,
                        telefonos: true,
                    }
                }
            },
            orderBy: {
                nombre: "asc"
            }
        })
        res.json(materiales);
    } catch (error) {
        console.error('Error en obtenerMateriales:', error);
        res.status(500).json({ error: 'Error interno al obtener los materiales' });
    }
};


// GET Obtener material por ID
const obtenerMaterialPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await prisma.material.findUnique({
            where: { id },
            include: {
                proveedor: { select: { nombre: true, email: true } }
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
        // Nota: Esto es para correcciones de captura. Las recargas de stock reales
        // en el futuro deberán hacerse mediante la tabla de "InventarioMovimiento".
        let nuevoCostoUnitario = materialActual.costoUnitario;
        if (data.precioCompra !== undefined && data.cantidadComprada !== undefined) {
            nuevoCostoUnitario = data.precioCompra / data.cantidadComprada;
        }

        const materialActualizado = await prisma.material.update({
            where: { id },
            data: {
                ...data,
                costoUnitario: nuevoCostoUnitario
            },
            include: {
                proveedor: { select: { nombre: true } }
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

        // No borramos de la base de datos (para no romper las recetas de Costeo)
        // Solo lo ocultamos cambiando activo a false
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
    eliminarMaterial
};