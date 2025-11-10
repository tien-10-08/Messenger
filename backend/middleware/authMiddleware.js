import jwt from "jsonwebtoken";

export const verifyTokenMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Thiếu token xác thực" });

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token không hợp lệ" });
    req.user = decoded;
    next();
  });
};
