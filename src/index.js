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

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor Kyro online y funcionando' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`:D Servidor backend corriendo en http://localhost:${PORT}`);
});