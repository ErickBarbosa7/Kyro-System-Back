const prisma = require('../db');

const obtenerCosteoPieza = async (req, res) => {
    try {
        const { piezaId } = req.params;

        const pieza = await prisma.pieza.findUnique({
            where: { id: piezaId },
            select: { id: true, clave: true, nombreComercial: true }
        });

        if (!pieza) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }

        const [metales, materiales, acabados, manoObra, gastos] = await Promise.all([
            prisma.costeoMetal.findMany({ where: { piezaId }, include: { metal: { select: { nombre: true } } } }),
            prisma.costeoMaterial.findMany({ where: { piezaId }, include: { material: { select: { nombre: true } } } }),
            prisma.costeoAcabado.findMany({ where: { piezaId }, include: { acabado: { select: { nombre: true } } } }),
            prisma.costeoManoObra.findMany({ where: { piezaId } }),
            prisma.costeoGastoAplicado.findMany({ where: { piezaId }, include: { gastoOperativo: { select: { concepto: true } } } })
        ]);

        res.json({ pieza, metales, materiales, acabados, manoObra, gastos });
    } catch (error) {
        console.error("Error en obtenerCosteoPieza:", error);
        res.status(500).json({ error: 'Error interno al obtener el costeo de la pieza' });
    }
};

const calcularTotales = async (req, res) => {
    try {
        const { piezaId } = req.params;

        const pieza = await prisma.pieza.findUnique({
            where: { id: piezaId },
            select: { id: true, clave: true, nombreComercial: true }
        });

        if (!pieza) {
            return res.status(404).json({ error: 'Pieza no encontrada' });
        }

        const [metales, materiales, acabados, manoObra, gastos] = await Promise.all([
            prisma.costeoMetal.findMany({ where: { piezaId } }),
            prisma.costeoMaterial.findMany({ where: { piezaId } }),
            prisma.costeoAcabado.findMany({ where: { piezaId } }),
            prisma.costeoManoObra.findMany({ where: { piezaId } }),
            prisma.costeoGastoAplicado.findMany({ where: { piezaId } })
        ]);

        const totalMetales = metales.reduce((sum, m) => sum + Number(m.subtotal), 0);
        const totalMateriales = materiales.reduce((sum, m) => sum + Number(m.subtotal), 0);
        const totalAcabados = acabados.reduce((sum, a) => sum + Number(a.subtotal), 0);
        const totalManoObra = manoObra.reduce((sum, mo) => sum + Number(mo.subtotal), 0);
        const totalGastos = gastos.reduce((sum, g) => sum + Number(g.importeAplicado), 0);

        const costeDirecto = totalMetales + totalMateriales + totalAcabados + totalManoObra;
        const costeTotal = costeDirecto + totalGastos;

        const margen = await prisma.configuracionMargen.findFirst({
            where: { activo: true },
            orderBy: { nombre: 'asc' }
        });

        let precioTaller = null;
        let precioMayorista = null;
        let precioPublico = null;

        if (margen) {
            precioTaller = Number((costeTotal * (1 + Number(margen.margenTaller))).toFixed(2));
            precioMayorista = Number((costeTotal * (1 + Number(margen.margenMayorista))).toFixed(2));
            precioPublico = Number((costeTotal * (1 + Number(margen.margenPublico))).toFixed(2));
        }

        res.json({
            pieza,
            desglose: {
                metales: { total: totalMetales, items: metales.length },
                materiales: { total: totalMateriales, items: materiales.length },
                acabados: { total: totalAcabados, items: acabados.length },
                manoObra: { total: totalManoObra, items: manoObra.length },
                gastosAplicados: { total: totalGastos, items: gastos.length }
            },
            costeDirecto: Number(costeDirecto.toFixed(2)),
            costeTotal: Number(costeTotal.toFixed(2)),
            margenes: margen ? {
                nombre: margen.nombre,
                margenTaller: Number(margen.margenTaller),
                margenMayorista: Number(margen.margenMayorista),
                margenPublico: Number(margen.margenPublico),
                precioTaller,
                precioMayorista,
                precioPublico
            } : null
        });
    } catch (error) {
        console.error("Error en calcularTotales:", error);
        res.status(500).json({ error: 'Error interno al calcular los totales del costeo' });
    }
};

const agregarMetal = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { metalId, pesoUtilizadoGr } = req.body;

        const pieza = await prisma.pieza.findUnique({ where: { id: piezaId } });
        if (!pieza) return res.status(404).json({ error: 'Pieza no encontrada' });

        const metalDb = await prisma.metal.findUnique({ where: { id: metalId } });
        if (!metalDb) return res.status(404).json({ error: 'El metal no existe' });

        const subtotal = Number(pesoUtilizadoGr) * Number(metalDb.precioPorGramo);

        const registro = await prisma.costeoMetal.create({
            data: {
                piezaId,
                metalId,
                pesoUtilizadoGr,
                precioGramoSnapshot: metalDb.precioPorGramo,
                subtotal
            },
            include: { metal: { select: { nombre: true } } }
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error("Error en agregarMetal:", error);
        res.status(500).json({ error: 'Error interno al agregar metal al costeo' });
    }
};

const agregarMaterial = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { materialId, cantidadUtilizada } = req.body;

        const pieza = await prisma.pieza.findUnique({ where: { id: piezaId } });
        if (!pieza) return res.status(404).json({ error: 'Pieza no encontrada' });

        const materialDb = await prisma.material.findUnique({ where: { id: materialId } });
        if (!materialDb) return res.status(404).json({ error: 'El material no existe' });

        const subtotal = Number(cantidadUtilizada) * Number(materialDb.costoUnitario);

        const registro = await prisma.costeoMaterial.create({
            data: {
                piezaId,
                materialId,
                cantidadUtilizada,
                costoUnitarioSnapshot: materialDb.costoUnitario,
                subtotal
            },
            include: { material: { select: { nombre: true } } }
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error("Error en agregarMaterial:", error);
        res.status(500).json({ error: 'Error interno al agregar material al costeo' });
    }
};

const agregarAcabado = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { acabadoId, cantidad } = req.body;

        const pieza = await prisma.pieza.findUnique({ where: { id: piezaId } });
        if (!pieza) return res.status(404).json({ error: 'Pieza no encontrada' });

        const acabadoDb = await prisma.acabado.findUnique({ where: { id: acabadoId } });
        if (!acabadoDb) return res.status(404).json({ error: 'El acabado no existe' });

        const subtotal = Number(cantidad) * Number(acabadoDb.costoBase);

        const registro = await prisma.costeoAcabado.create({
            data: {
                piezaId,
                acabadoId,
                cantidad,
                costoUnitarioSnapshot: acabadoDb.costoBase,
                subtotal
            },
            include: { acabado: { select: { nombre: true } } }
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error("Error en agregarAcabado:", error);
        res.status(500).json({ error: 'Error interno al agregar acabado al costeo' });
    }
};

const agregarManoObra = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { actividad, tiempoHrs, costoPorHora } = req.body;

        const pieza = await prisma.pieza.findUnique({ where: { id: piezaId } });
        if (!pieza) return res.status(404).json({ error: 'Pieza no encontrada' });

        const subtotal = Number(tiempoHrs) * Number(costoPorHora);

        const registro = await prisma.costeoManoObra.create({
            data: { piezaId, actividad, tiempoHrs, costoPorHora, subtotal }
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error("Error en agregarManoObra:", error);
        res.status(500).json({ error: 'Error interno al agregar mano de obra al costeo' });
    }
};

const agregarGasto = async (req, res) => {
    try {
        const { piezaId } = req.params;
        const { gastoId, importeAplicado } = req.body;

        const pieza = await prisma.pieza.findUnique({ where: { id: piezaId } });
        if (!pieza) return res.status(404).json({ error: 'Pieza no encontrada' });

        const gastoDb = await prisma.gastoOperativo.findUnique({ where: { id: gastoId } });
        if (!gastoDb) return res.status(404).json({ error: 'El gasto operativo no existe' });

        const registro = await prisma.costeoGastoAplicado.create({
            data: { piezaId, gastoId, importeAplicado },
            include: { gastoOperativo: { select: { concepto: true } } }
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error("Error en agregarGasto:", error);
        res.status(500).json({ error: 'Error interno al aplicar gasto al costeo' });
    }
};

const actualizarMetal = async (req, res) => {
    try {
        const { id } = req.params;
        const { pesoUtilizadoGr } = req.body;

        const actual = await prisma.costeoMetal.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: 'Registro de metal no encontrado' });

        const subtotal = Number(pesoUtilizadoGr) * Number(actual.precioGramoSnapshot);

        const registro = await prisma.costeoMetal.update({
            where: { id },
            data: { pesoUtilizadoGr, subtotal },
            include: { metal: { select: { nombre: true } } }
        });

        res.json(registro);
    } catch (error) {
        console.error("Error en actualizarMetal:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de metal no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar metal del costeo' });
    }
};

const actualizarMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidadUtilizada } = req.body;

        const actual = await prisma.costeoMaterial.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: 'Registro de material no encontrado' });

        const subtotal = Number(cantidadUtilizada) * Number(actual.costoUnitarioSnapshot);

        const registro = await prisma.costeoMaterial.update({
            where: { id },
            data: { cantidadUtilizada, subtotal },
            include: { material: { select: { nombre: true } } }
        });

        res.json(registro);
    } catch (error) {
        console.error("Error en actualizarMaterial:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de material no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar material del costeo' });
    }
};

const actualizarAcabado = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;

        const actual = await prisma.costeoAcabado.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: 'Registro de acabado no encontrado' });

        const subtotal = Number(cantidad) * Number(actual.costoUnitarioSnapshot);

        const registro = await prisma.costeoAcabado.update({
            where: { id },
            data: { cantidad, subtotal },
            include: { acabado: { select: { nombre: true } } }
        });

        res.json(registro);
    } catch (error) {
        console.error("Error en actualizarAcabado:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de acabado no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar acabado del costeo' });
    }
};

const actualizarManoObra = async (req, res) => {
    try {
        const { id } = req.params;
        const { actividad, tiempoHrs, costoPorHora } = req.body;

        const actual = await prisma.costeoManoObra.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: 'Registro de mano de obra no encontrado' });

        const tiempo = tiempoHrs !== undefined ? tiempoHrs : actual.tiempoHrs;
        const costo = costoPorHora !== undefined ? costoPorHora : actual.costoPorHora;
        const subtotal = Number(tiempo) * Number(costo);

        const data = {};
        if (actividad !== undefined) data.actividad = actividad;
        if (tiempoHrs !== undefined) data.tiempoHrs = tiempoHrs;
        if (costoPorHora !== undefined) data.costoPorHora = costoPorHora;
        data.subtotal = subtotal;

        const registro = await prisma.costeoManoObra.update({
            where: { id },
            data
        });

        res.json(registro);
    } catch (error) {
        console.error("Error en actualizarManoObra:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de mano de obra no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar mano de obra del costeo' });
    }
};

const actualizarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const { importeAplicado } = req.body;

        const registro = await prisma.costeoGastoAplicado.update({
            where: { id },
            data: { importeAplicado },
            include: { gastoOperativo: { select: { concepto: true } } }
        });

        res.json(registro);
    } catch (error) {
        console.error("Error en actualizarGasto:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de gasto no encontrado' });
        res.status(500).json({ error: 'Error interno al actualizar gasto aplicado del costeo' });
    }
};

const eliminarMetal = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costeoMetal.delete({ where: { id } });
        res.json({ mensaje: 'Metal eliminado del costeo correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de metal no encontrado' });
        console.error("Error en eliminarMetal:", error);
        res.status(500).json({ error: 'Error interno al eliminar metal del costeo' });
    }
};

const eliminarMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costeoMaterial.delete({ where: { id } });
        res.json({ mensaje: 'Material eliminado del costeo correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de material no encontrado' });
        console.error("Error en eliminarMaterial:", error);
        res.status(500).json({ error: 'Error interno al eliminar material del costeo' });
    }
};

const eliminarAcabado = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costeoAcabado.delete({ where: { id } });
        res.json({ mensaje: 'Acabado eliminado del costeo correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de acabado no encontrado' });
        console.error("Error en eliminarAcabado:", error);
        res.status(500).json({ error: 'Error interno al eliminar acabado del costeo' });
    }
};

const eliminarManoObra = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costeoManoObra.delete({ where: { id } });
        res.json({ mensaje: 'Mano de obra eliminada del costeo correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de mano de obra no encontrado' });
        console.error("Error en eliminarManoObra:", error);
        res.status(500).json({ error: 'Error interno al eliminar mano de obra del costeo' });
    }
};

const eliminarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.costeoGastoAplicado.delete({ where: { id } });
        res.json({ mensaje: 'Gasto eliminado del costeo correctamente' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro de gasto no encontrado' });
        console.error("Error en eliminarGasto:", error);
        res.status(500).json({ error: 'Error interno al eliminar gasto del costeo' });
    }
};

module.exports = {
    obtenerCosteoPieza,
    calcularTotales,
    agregarMetal,
    agregarMaterial,
    agregarAcabado,
    agregarManoObra,
    agregarGasto,
    actualizarMetal,
    actualizarMaterial,
    actualizarAcabado,
    actualizarManoObra,
    actualizarGasto,
    eliminarMetal,
    eliminarMaterial,
    eliminarAcabado,
    eliminarManoObra,
    eliminarGasto
};
