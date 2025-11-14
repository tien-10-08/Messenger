import * as authService from "../services/authService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const newUser = await authService.registerUser({ username, email, password });

  res.status(HTTP_STATUS.CREATED).json({
    message: "Đăng ký thành công",
    data: newUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await authService.loginUser(email, password);

  res.status(HTTP_STATUS.OK).json({
    message: "Đăng nhập thành công",
    data,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    message: "Lấy thông tin người dùng thành công",
    data: user,
  });
});
