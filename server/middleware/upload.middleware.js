const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");

// ─── Storage: memory (files streamed directly to Cloudinary) ──────────────
const storage = multer.memoryStorage();

// ─── File filter: allow images only ──────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new ApiError(400, "Only image files are allowed (jpeg, jpg, png, webp, gif)."));
};

// ─── Multer instance ──────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB per file
    files: 5,                    // max 5 files at once
  },
});

/**
 * Single file upload field named 'image'
 * Usage: router.post("/", uploadSingle, handler)
 */
const uploadSingle = upload.single("image");

/**
 * Multiple files under field 'images' (max 5)
 * Usage: router.post("/products", uploadMultiple, handler)
 */
const uploadMultiple = upload.array("images", 5);

module.exports = { uploadSingle, uploadMultiple, upload };
