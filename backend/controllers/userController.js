// controllers/userController.js
import * as userService from "../services/userService.js";

/**
 * GET /api/users
 * Query: q (tìm kiếm), page, limit
 * Yêu cầu JWT → req.user.id
 */
export const getAllUsers = async (req, res) => {
  try {
    const meId = req.user?.id;
    if (!meId) return res.status(401).json({ error: "Unauthorized" });

    const { q = "", page = 1, limit = 20 } = req.query;

    const result = await userService.listUsers({
      meId,
      q,
      page,
      limit,
    });

    res.status(200).json({
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const u = await userService.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: "Không tìm thấy user" });
    res.status(200).json({ data: u });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
