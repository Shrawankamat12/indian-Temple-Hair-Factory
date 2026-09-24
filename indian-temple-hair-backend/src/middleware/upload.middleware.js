const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

// Same public API as before: `upload.single('image')`. Internally picks
// Cloudinary storage when CLOUDINARY_* env vars are set, otherwise falls
// back to the original local disk storage — nothing else needs to change.
let storage;

if (isConfigured) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'indian-temple-hair',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });
} else {
  // Local disk fallback. `src/uploads` is not guaranteed to exist (fresh
  // clones, ephemeral filesystems on some hosts) — multer's diskStorage
  // does NOT create the destination folder itself and fails with ENOENT
  // if it's missing, so every upload silently errors out. Create it up
  // front, and again defensively inside `destination` in case it gets
  // wiped mid-run.
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('Only image files are allowed'), ok);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
