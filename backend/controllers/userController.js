import * as userService from "../services/userService.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

/**
 * GET /api/users?q=keyword&page=1&limit=10
 * Tìm kiếm user theo username/email
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const meId = req.user?.id;
  if (!meId) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  const { q = "", page = 1, limit = 10 } = req.query;

  // Return empty if no keyword
  if (!q.trim()) {
    return res.status(HTTP_STATUS.OK).json({ data: [], pagination: null });
  }

  const result = await userService.searchUsers({
    meId,
    keyword: q,
    page,
    limit,
  });

  res.status(HTTP_STATUS.OK).json({
    data: result.items,
    pagination: result.pagination,
  });
});

/**
 * GET /api/users/:id
 * Lấy thông tin chi tiết một user
 */
export const getUserById = asyncHandler(async (req, res) => {
  const found = await userService.getUser(req.params.id);

  res.status(HTTP_STATUS.OK).json({ data: found });
});
