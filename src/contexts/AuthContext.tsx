import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "FARMER" | "DEALER" | "ADMIN";
  district?: string;
  shopName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("km_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("km_token");
  });
  const [loading, setLoading] = useState(false);

  // If no user is logged in, default to the demo farmer user so all features are immediately testable
  useEffect(() => {
    if (!user) {
      const demoUser: User = {
        id: "farmer-demo-1",
        name: "Ramesh Kumar (Demo Farmer)",
        phone: "+91 9812345678",
        role: "FARMER",
        district: "Cuttack",
      };
      setUser(demoUser);
    }
  }, [user]);

  const login = async (phone: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("km_user", JSON.stringify(res.data.user));
        localStorage.setItem("km_token", res.data.token);
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", data);
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("km_user", JSON.stringify(res.data.user));
        localStorage.setItem("km_token", res.data.token);
      } else {
        throw new Error(res.data.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("km_user");
    localStorage.removeItem("km_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
