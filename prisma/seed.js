const prisma = require('../src/db'); 
const bcrypt = require('bcryptjs'); 

async function main() {
  console.log('🌱 Iniciando seeder para el entorno de desarrollo...');

  // ==========================================
  // 1. CREAR ROLES
  // ==========================================
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {}, // Si ya existe, no hace nada
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema',
    },
  });

  const rolProduccion = await prisma.rol.upsert({
    where: { nombre: 'Produccion' },
    update: {},
    create: {
      nombre: 'Produccion',
      descripcion: 'Acceso limitado a inventario y costeo',
    },
  });
  console.log('✅ Roles creados o verificados');

  // ==========================================
  // 2. CREAR USUARIO DEV
  // ==========================================
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin123', saltRounds);

  const devUser = await prisma.usuario.upsert({
    where: { email: 'dev@kyro.com' },
    update: {
      password: hashedPassword,
      rolId: rolAdmin.id
    },
    create: {
      nombre: 'Admin',
      apellido: 'Developer',
      email: 'dev@kyro.com',
      password: hashedPassword,
      rolId: rolAdmin.id,
    },
  });
  console.log(`✅ Usuario Dev listo -> Email: dev@kyro.com | Pass: admin123`);

  // ==========================================
  // 3. DATOS DE PRUEBA: CATEGORÍAS
  // ==========================================
  await prisma.categoriaMaterial.upsert({
    where: { nombre: 'Piedras Preciosas' },
    update: {},
    create: { nombre: 'Piedras Preciosas', descripcion: 'Diamantes, Esmeraldas, etc.' }
  });

  await prisma.categoriaMaterial.upsert({
    where: { nombre: 'Fornituras' },
    update: {},
    create: { nombre: 'Fornituras', descripcion: 'Broches, argollas, etc.' }
  });
  console.log('✅ Categorías de prueba generadas');

  // ==========================================
  // 4. DATOS DE PRUEBA: UNIDADES DE MEDIDA (¡NUEVO!)
  // ==========================================
  const unidadesBasicas = ['PIEZA', 'GRAMO', 'PAR', 'LOTE', 'TIRA', 'PIEZA CH', 'PIEZA M', 'PIEZA G'];
  
  for (const nombreUnidad of unidadesBasicas) {
    await prisma.unidadMedida.upsert({
      where: { nombre: nombreUnidad },
      update: {},
      create: { nombre: nombreUnidad }
    });
  }
  console.log('✅ Unidades de Medida base generadas');

  console.log('🎉 Seeder ejecutado con éxito. Ya puedes iniciar sesión.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });