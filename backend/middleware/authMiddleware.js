import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

export const verifyTokenMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new AppError(ERROR_MESSAGES.AUTH_MISSING_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = header.split(" ")[1];
    if (!token) {
      throw new AppError(ERROR_MESSAGES.AUTH_INVALID_TOKEN, HTTP_STATUS.FORBIDDEN);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new AppError(ERROR_MESSAGES.AUTH_INVALID_TOKEN, HTTP_STATUS.FORBIDDEN);
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};
