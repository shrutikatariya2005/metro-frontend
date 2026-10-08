// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://metro-backend-3t8n.onrender.com/api/v1",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("metro_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // If we already have a user from localStorage, don't block the UI with loading
  const [loading, setLoading] = useState(!localStorage.getItem("metro_user"));

  useEffect(() => {
    // Background verify session
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("metro_user", JSON.stringify(res.data.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("metro_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const loggedInUser = res.data.data.user;
    setUser(loggedInUser);
    localStorage.setItem("metro_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data.data;
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    localStorage.removeItem("metro_user");
  };

  const requestOtp = async (email) => {
    return api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (data) => {
    const res = await api.post("/auth/reset-password", data);
    const resetUser = res.data.data.user;
    setUser(resetUser);
    localStorage.setItem("metro_user", JSON.stringify(resetUser));
    return resetUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
