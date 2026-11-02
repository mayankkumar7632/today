const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'profile-photos');
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${req.user.id}-${Date.now()}${extension}`);
  }
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error('Please upload a JPG, JPEG, PNG, or WEBP image.'));
    }
    callback(null, true);
  }
}).single('photo');

const uploadProfilePhoto = (req, res, next) => {
  multerUpload(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Profile photos must be 2 MB or smaller.'
        : error.message || 'Could not upload the profile photo.';
      return res.status(400).json({ success: false, message });
    }
    next();
  });
};

module.exports = { uploadProfilePhoto };
