import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/jwtHelper.js";
import { AppError } from "../utils/errorHandler.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/errorHandler.js";
import { CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

export const registerUser = async ({ username, email, password }) => {
  // Validation
  validateUsername(username);
  validateEmail(email) || new AppError("Email không hợp lệ", HTTP_STATUS.BAD_REQUEST);
  validatePassword(password);

  // Check if email exists
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError(ERROR_MESSAGES.AUTH_EMAIL_EXISTS, HTTP_STATUS.CONFLICT);

  // Hash password & create user
  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username: username.trim(),
    email: email.toLowerCase(),
    password: hashed,
  });

  return {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
  };
};

export const loginUser = async (email, password) => {
  // Validation
  if (!email || !password) {
    throw new AppError(ERROR_MESSAGES.AUTH_MISSING_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError(ERROR_MESSAGES.AUTH_EMAIL_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);

  // Verify password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError(ERROR_MESSAGES.AUTH_INVALID_PASSWORD, HTTP_STATUS.UNAUTHORIZED);

  // Generate token
  const payload = { id: user._id, email: user.email, username: user.username };
  const token = generateToken(payload, CONFIG.JWT_EXPIRY);

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
    },
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  return user;
};
