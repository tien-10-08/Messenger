// controllers/userController.js
import * as userService from "../services/userService.js";

/**
 * GET /api/users?q=keyword&page=1&limit=10
 * Tìm kiếm user theo username/email (trừ bản thân)
 */
export const searchUsers = async (req, res) => {
  try {
    const meId = req.user?.id;
    if (!meId) return res.status(401).json({ error: "Unauthorized" });

    const { q = "", page = 1, limit = 10 } = req.query;

    // ⚙️ Nếu frontend chưa nhập gì → không cần query DB
    if (!q.trim()) {
      return res.status(200).json({ data: [], pagination: null });
    }

    const result = await userService.searchUsers({
      meId,
      keyword: q,
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
 * Lấy thông tin chi tiết một user (safe fields)
 */
export const getUserById = async (req, res) => {
  try {
    const user = await userService.searchUsers({ meId: null, keyword: "", page: 1, limit: 1 });
    const found = await userService.getUser(req.params.id);
    if (!found) return res.status(404).json({ error: "Không tìm thấy user" });
    res.status(200).json({ data: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
