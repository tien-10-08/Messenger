import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return stored && stored !== "undefined" ? stored : null;
  });

  const login = (userData, jwt) => {
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id,
    };

    setUser(normalizedUser);
    setToken(jwt);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
