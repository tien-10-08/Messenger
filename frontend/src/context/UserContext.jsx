import { createContext, useContext, useState } from "react";
import { searchUsers } from "../api/userApi";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({}); // Lưu kết quả search để tránh gọi lại API nhiều lần

  const fetchUsers = async (keyword = "") => {
    if (!keyword.trim()) return setUsers([]);
    if (cache[keyword]) {
      setUsers(cache[keyword]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchUsers(keyword);
      const data = res.data?.items || res.data?.data || [];
      setUsers(data);
      setCache((prev) => ({ ...prev, [keyword]: data }));
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ users, loading, error, fetchUsers, setUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);
