import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hc_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("hc_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const authData = res.data;
      if (authData && authData.token) {
        localStorage.setItem("hc_token", authData.token);
        localStorage.setItem("hc_user", JSON.stringify(authData));
        setToken(authData.token);
        setUser(authData);
        api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
        return { success: true, user: authData };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid email or password. Please verify your credentials.";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(payload) {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/google", payload);
      const authData = res.data;
      if (authData && authData.pendingVerification) {
        return {
          success: true,
          pendingVerification: true,
          message: authData.message,
          user: authData,
        };
      }
      if (authData && authData.token) {
        localStorage.setItem("hc_token", authData.token);
        localStorage.setItem("hc_user", JSON.stringify(authData));
        setToken(authData.token);
        setUser(authData);
        api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
        return { success: true, user: authData };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Google authentication failed. Please try again.";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }

  function setSession(authData) {
    if (authData && authData.token) {
      localStorage.setItem("hc_token", authData.token);
      localStorage.setItem("hc_user", JSON.stringify(authData));
      setToken(authData.token);
      setUser(authData);
      api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
    }
  }

  function logout() {
    localStorage.removeItem("hc_token");
    localStorage.removeItem("hc_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("healthcure_user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    window.location.replace("/");
  }

  const role = user?.role ? user.role.toUpperCase() : null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
