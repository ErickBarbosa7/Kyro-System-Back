const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Sembrando datos base y de prueba en Kyro...');

    // 1. Limpieza previa (Opcional, evita duplicados de datos de prueba si corres el seed varias veces)
    // El orden importa para no romper restricciones de clave foránea
    await prisma.acabado.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.categoriaMaterial.deleteMany({});
    await prisma.metal.deleteMany({});
    await prisma.coleccion.deleteMany({});
    await prisma.tipoPieza.deleteMany({});
    await prisma.rol.deleteMany({});

    console.log('🧹 Base de datos limpia de pruebas anteriores.');

    // 2. Sembrar Roles (Estructura fija del sistema)
    const adminRol = await prisma.rol.create({
        data: { nombre: 'Administrador', descripcion: 'Control total del sistema' }
    });
    await prisma.rol.create({
        data: { nombre: 'Produccion', descripcion: 'Gestión de talleres y costeo de piezas' }
    });
    await prisma.rol.create({
        data: { nombre: 'Ventas', descripcion: 'Consulta de piezas y control de skus' }
    });

    // 3. Sembrar Catálogos Base (Para la receta de la pieza)
    const tipoAnillo = await prisma.tipoPieza.create({
        data: { nombre: 'Anillo', codigo: 'ANL' }
    });
    
    const coleccionPR26 = await prisma.coleccion.create({
        data: { nombre: 'Primavera 2026', codigo: 'PR26', descripcion: 'Lanzamiento de temporada' }
    });

    const catGemas = await prisma.categoriaMaterial.create({
        data: { nombre: 'Gemas Preciosas', descripcion: 'Piedras preciosas y semipreciosas para engarzar' }
    });

    // 4. Sembrar Insumos con Valores Numéricos (Campos Decimal mapeados)
    const diamante = await prisma.material.create({
        data: {
            nombre: 'Diamante Corte Brillante 0.5ct',
            categoriaId: catGemas.id,
            unidadCompra: 'Piezas',
            precioCompra: 12000.00,
            cantidadComprada: 10,
            costoUnitario: 12000.00,
            stockDisponible: 10,
            stockMinimo: 2
        }
    });

    const oro14k = await prisma.metal.create({
        data: {
            nombre: 'Oro 14K Amarillo',
            precioPorGramo: 850.50,
            stockDisponible: 300,
            stockMinimo: 50
        }
    });

    const pulidoEspejo = await prisma.acabado.create({
        data: {
            nombre: 'Pulido Espejo de Alta Calidad',
            tipoCobro: 'POR_PIEZA',
            costoBase: 120.00
        }
    });

    console.log('\n ¡Base de datos poblada con éxito!');
    console.log('==================================================');
    console.log('👇 COPIA ESTOS UUIDs PARA TU PRUEBA EN POSTMAN 👇');
    console.log('==================================================');
    console.log(`"tipoId": "${tipoAnillo.id}"`);
    console.log(`"coleccionId": "${coleccionPR26.id}"`);
    console.log(`"metalId": "${oro14k.id}"`);
    console.log(`"materialId": "${diamante.id}"`);
    console.log(`"acabadoId": "${pulidoEspejo.id}"`);
    console.log('==================================================\n');
}

main()
    .catch((e) => {
        console.error('🚨 Error ejecutando el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });