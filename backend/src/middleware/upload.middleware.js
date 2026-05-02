/**
 * src/middleware/upload.middleware.js
 * Multer configuration for file uploads.
 * Used for leave document attachments.
 *
 * - Storage: disk (local uploads/leaves/ folder)
 * - Allowed: PDF, JPG, PNG, JPEG
 * - Max size: 5MB
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError.js";

// Ensure upload directory exists
const uploadDir = "uploads/leaves";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename: timestamp + original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `leave-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF, JPG, and PNG files are allowed", 400), false);
  }
};

export const uploadLeaveDoc = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("document");

/**
 * Express-compatible wrapper for multer to support async/await error flow.
 */
export const handleLeaveUpload = (req, res, next) => {
  uploadLeaveDoc(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) {
      return next(err);
    }
    next();
  });
};
