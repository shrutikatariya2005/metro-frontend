// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const requestOtp = async (email) => {
    return api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (data) => {
    const res = await api.post("/auth/reset-password", data);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
