import multer from "multer";
import path from "path";
import { validateMimeType } from "../utils/errorHandler.js";
import { CONFIG } from "../config/constants.js";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  try {
    const type = file.mimetype.startsWith("image") ? "image" : "audio";
    validateMimeType(file.mimetype, type);
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
