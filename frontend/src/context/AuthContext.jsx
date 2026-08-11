import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { loginUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("campus_user");

    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("campus_token")
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("campus_token");
      localStorage.removeItem("campus_user");
    }
  }, [token]);

  const login = async (studentId, password) => {
    setLoading(true);

    try {
      const result = await loginUser(studentId, password);

      if (!result.success) {
        throw new Error(
          result.message || "Login failed"
        );
      }

      localStorage.setItem(
        "campus_token",
        result.token
      );

      localStorage.setItem(
        "campus_user",
        JSON.stringify(result.user)
      );

      setToken(result.token);
      setUser(result.user);

      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};