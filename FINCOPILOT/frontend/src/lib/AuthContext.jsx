import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setUnauthorizedHandler } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("fincopilot_token");
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("fincopilot_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setUser(res.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  async function login(email, password) {
    const res = await api.login({ email, password });
    localStorage.setItem("fincopilot_token", res.token);
    setUser(res.user);
    return res.user;
  }

  async function signup(name, email, password) {
    const res = await api.signup({ name, email, password });
    localStorage.setItem("fincopilot_token", res.token);
    setUser(res.user);
    return res.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
