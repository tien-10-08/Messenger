import { createContext, useContext, useState } from "react";
import { searchUsers } from "../api/userApi";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({}); 

  const fetchUsers = async (keyword = "") => {
    if (!keyword.trim()) {
      setUsers([]);
      return;
    }

    // 🔹 Kiểm tra cache
    if (cache[keyword]) {
      setUsers(cache[keyword]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchUsers(keyword); 
      setUsers(Array.isArray(data) ? data : []);
      setCache((prev) => ({ ...prev, [keyword]: data }));
    } catch (err) {
      console.error("❌ Lỗi fetchUsers:", err);
      setError(err.response?.data?.error || "Lỗi tải danh sách user");
      setUsers([]);
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
