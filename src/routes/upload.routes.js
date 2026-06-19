const { Router } = require('express');
const { uploadImage } = require('../middlewares/upload.middleware');
const { verificarToken } = require('../middlewares/auth.middleware');
const cloudinary = require('../config/cloudinary');

const router = Router();
router.use(verificarToken);

router.post('/pieza-imagen', uploadImage.single('imagen'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ninguna imagen' });
        }
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'erp-joyeria/piezas', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

module.exports = router;
