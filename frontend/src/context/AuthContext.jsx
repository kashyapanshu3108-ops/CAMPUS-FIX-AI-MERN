import { createContext, useContext, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("campusfix_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, verify the stored token is still valid by calling /auth/me.
  useEffect(() => {
    const token = localStorage.getItem("campusfix_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("campusfix_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("campusfix_token");
        localStorage.removeItem("campusfix_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("campusfix_token", res.data.token);
      localStorage.setItem("campusfix_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.post("/auth/register", payload);
      localStorage.setItem("campusfix_token", res.data.token);
      localStorage.setItem("campusfix_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const logout = () => {
    localStorage.removeItem("campusfix_token");
    localStorage.removeItem("campusfix_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
