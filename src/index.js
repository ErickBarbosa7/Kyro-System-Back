require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());


const authRoutes = require('./routes/auth.routes');
const coleccionesRoutes = require('./routes/colecciones.routes');
const materialesRoutes = require('./routes/materiales.routes');
const categoriasMaterialRoutes = require('./routes/categoriasMaterial.routes');
const metalesRoutes = require('./routes/metales.routes');
const acabadosRoutes = require('./routes/acabados.routes');
const tiposPiezaRoutes = require('./routes/tiposPieza.routes');
const configuracionMargenRoutes = require('./routes/configuracionMargen.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const piezasRoutes = require('./routes/piezas.routes');
const costeoRoutes = require('./routes/costeo.routes');
const unidadesRoutes = require('./routes/unidadesMedida.routes'); 
const gastosOperativosRoutes = require('./routes/gastosOperativos.routes');
const stockRoutes = require('./routes/stock.routes');
const piezasSkuRoutes = require('./routes/piezasSku.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const uploadRoutes = require('./routes/upload.routes');

// Endpoints
app.use('/api/auth', authRoutes); 

// Colecciones 
app.use('/api/colecciones', coleccionesRoutes);

// Materiales
app.use('/api/materiales', materialesRoutes);

// Categorias de Materiales
app.use('/api/categorias-material', categoriasMaterialRoutes);

// Metales
app.use('/api/metales', metalesRoutes);

// Unidades de Medida
app.use('/api/unidades', unidadesRoutes);

// Acabados
app.use('/api/acabados', acabadosRoutes);

// Tipos de Pieza
app.use('/api/tipos-pieza', tiposPiezaRoutes);

// Configuración de Márgenes
app.use('/api/configuracion-margenes', configuracionMargenRoutes);

// Proveedores
app.use('/api/proveedores', proveedoresRoutes);

// Gastos Operativos
app.use('/api/gastos-operativos', gastosOperativosRoutes);

//Piezas
app.use('/api/piezas', piezasRoutes);

// Costeo
app.use('/api/costeo', costeoRoutes);

// Stock y Movimientos
app.use('/api/stock', stockRoutes);

// SKUs de Piezas
app.use('/api/piezas-sku', piezasSkuRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Inventario (Resumen)
app.use('/api/inventario', inventarioRoutes);

// Uploads
app.use('/api/upload', uploadRoutes);
// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor Kyro online y funcionando' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`:D Servidor backend corriendo en http://localhost:${PORT}`);
});