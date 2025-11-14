// Backend Error Handler & Logger
import { CONFIG, ERROR_MESSAGES } from "../config/constants.js";

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log errors
  if (statusCode >= 500) {
    console.error("🔥 Server Error:", {
      message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation utilities

export const validateEmail = (email) => {
  return CONFIG.EMAIL_REGEX.test(email);
};

export const validatePassword = (password) => {
  if (!password || password.length < CONFIG.PASSWORD_MIN_LENGTH) {
    throw new AppError(
      `Mật khẩu phải ít nhất ${CONFIG.PASSWORD_MIN_LENGTH} ký tự`,
      400
    );
  }
};

export const validateUsername = (username) => {
  if (!username || username.trim().length < CONFIG.USERNAME_MIN_LENGTH) {
    throw new AppError(
      `Tên người dùng phải ít nhất ${CONFIG.USERNAME_MIN_LENGTH} ký tự`,
      400
    );
  }
  if (username.length > CONFIG.USERNAME_MAX_LENGTH) {
    throw new AppError(
      `Tên người dùng không vượt quá ${CONFIG.USERNAME_MAX_LENGTH} ký tự`,
      400
    );
  }
};

export const validateMimeType = (mimetype, type = "image") => {
  const allowed =
    type === "image" ? CONFIG.ALLOWED_MIME_TYPES.IMAGE : CONFIG.ALLOWED_MIME_TYPES.AUDIO;
  if (!allowed.includes(mimetype)) {
    throw new AppError(ERROR_MESSAGES.FILE_INVALID_TYPE, 400);
  }
};
