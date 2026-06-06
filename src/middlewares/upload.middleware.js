const multer = require('multer');

// Usamos memoryStorage para manejar la imagen en la memoria RAM (como Buffer)
const storage = multer.memoryStorage();

const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por foto
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser una imagen válida.'));
        }
    }
});

module.exports = { uploadImage };