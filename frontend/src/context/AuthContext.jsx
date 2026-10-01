import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  getMeRequest,
} from "../services/authService";

const AuthContext = createContext(null);

// IMPORTANT: This app stores NOTHING in localStorage or sessionStorage.
// The JWT lives only in an HTTP-only cookie set by the backend, which the
// browser attaches automatically. On every page load we simply ask the
// backend "who am I?" via GET /auth/me. If the cookie is missing/expired,
// that call returns 401 and we know the user is logged out.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await getMeRequest();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
