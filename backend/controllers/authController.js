import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "Thiếu thông tin đăng ký" });

    const newUser = await authService.registerUser({ username, email, password });
    res.status(201).json({
      message: "Đăng ký thành công",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });

    const data = await authService.loginUser(email, password);
    res.status(200).json({
      message: "Đăng nhập thành công",
      data,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      data: user,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
