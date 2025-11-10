import jwt from "jsonwebtoken";

export const generateToken = (payload, expires = "7d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
