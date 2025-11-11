import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ✅ Bảo vệ route: nếu chưa login → redirect về /login
 * Dùng cho các route yêu cầu xác thực, ví dụ: ChatPage, Dashboard, Profile...
 */
export default function ProtectedRoute({ children }) {
  const { user, token } = useAuth();

  // Nếu chưa có user hoặc token → quay về login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
