import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  village: string;
  address: string;
  role: "FARMER" | "DEALER" | "ADMIN";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOTP: (phone: string) => string;
  verifyOTP: (phone: string, otp: string) => boolean;
  register: (data: Omit<User, "id" | "createdAt"> & { pincode: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  sendOTP: () => "",
  verifyOTP: () => false,
  register: () => ({ success: false }),
  logout: () => {},
  updateProfile: () => {},
});

// Helper to get all registered users from localStorage
function getRegisteredUsers(): (User & { password?: string })[] {
  try {
    return JSON.parse(localStorage.getItem("agn_registered_users") || "[]");
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: (User & { password?: string })[]) {
  localStorage.setItem("agn_registered_users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("agn_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // OTP store: phone → { otp, expiresAt }
  const [otpStore, setOtpStore] = useState<Record<string, { otp: string; expiresAt: number }>>({});

  const sendOTP = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, "");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    setOtpStore((prev) => ({ ...prev, [cleanPhone]: { otp, expiresAt } }));
    console.log(`[AgriNexus OTP] Your OTP for ${phone} is: ${otp}`);
    return otp;
  };

  const verifyOTP = (phone: string, otp: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    const stored = otpStore[cleanPhone];
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) return false;
    if (stored.otp !== otp) return false;
    // OTP verified — clear it
    setOtpStore((prev) => {
      const next = { ...prev };
      delete next[cleanPhone];
      return next;
    });
    return true;
  };

  const register = (data: Omit<User, "id" | "createdAt"> & { pincode: string }): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const cleanPhone = data.phone.replace(/\D/g, "");

    // Check duplicate
    const existing = users.find((u) => u.phone.replace(/\D/g, "") === cleanPhone);
    if (existing) {
      return { success: false, error: "This mobile number is already registered. Please login instead." };
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      phone: data.phone,
      city: data.city,
      state: data.state,
      district: data.district || "",
      pincode: data.pincode,
      village: data.village,
      address: data.address || "",
      role: "FARMER",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveRegisteredUsers(users);
    setUser(newUser);
    localStorage.setItem("agn_current_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("agn_current_user");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("agn_current_user", JSON.stringify(updated));

    // Also update in registered users list
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      saveRegisteredUsers(users);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
