import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/jwtHelper.js";

export const registerUser = async ({ username, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email đã tồn tại");

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashed });

  return {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email không tồn tại");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Sai mật khẩu");

  const payload = { id: user._id, email: user.email, username: user.username };
  const token = generateToken(payload);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};
