import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

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
  sendOTP: (phone: string) => Promise<string>;
  verifyOTP: (phone: string, otp: string) => Promise<boolean>;
  register: (data: Omit<User, "id" | "createdAt"> & { pincode: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  sendOTP: async () => "",
  verifyOTP: async () => false,
  register: async () => ({ success: false }),
  logout: () => {},
  updateProfile: () => {},
});

// ---- localStorage fallback helpers ----
function getLocalUsers(): (User & { password?: string })[] {
  try {
    return JSON.parse(localStorage.getItem("agn_registered_users") || "[]");
  } catch {
    return [];
  }
}

function saveLocalUsers(users: (User & { password?: string })[]) {
  localStorage.setItem("agn_registered_users", JSON.stringify(users));
}

// Log search to Supabase or localStorage
export async function logSearch(
  farmerId: string | null,
  searchType: string,
  query: string,
  result?: unknown,
  location?: string
) {
  if (isSupabaseConfigured() && supabase && farmerId) {
    await supabase.from("search_history").insert({
      farmer_id: farmerId,
      search_type: searchType,
      search_query: query,
      search_result: result || null,
      location: location || "",
    });
  }
  // Also store in localStorage as backup
  try {
    const history = JSON.parse(localStorage.getItem("agn_search_history") || "[]");
    history.unshift({
      id: Date.now(),
      farmerId,
      searchType,
      query,
      result,
      location,
      createdAt: new Date().toISOString(),
    });
    // Keep last 200 searches
    localStorage.setItem("agn_search_history", JSON.stringify(history.slice(0, 200)));
  } catch {
    // ignore
  }
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

  // OTP store for localStorage fallback mode
  const [otpStore, setOtpStore] = useState<Record<string, { otp: string; expiresAt: number }>>({});

  // On mount: if Supabase configured, check session
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Fetch profile from farmers table
        const { data: profile } = await supabase
          .from("farmers")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          const u: User = {
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
            state: profile.state,
            district: profile.district,
            pincode: profile.pincode,
            village: profile.village,
            address: profile.address,
            role: profile.role,
            createdAt: profile.created_at,
          };
          setUser(u);
          localStorage.setItem("agn_current_user", JSON.stringify(u));
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("agn_current_user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---- Send OTP ----
  const sendOTP = useCallback(async (phone: string): Promise<string> => {
    const cleanPhone = phone.replace(/\D/g, "");
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    if (isSupabaseConfigured() && supabase) {
      // Store OTP in Supabase (for demo — in production use Twilio/MSG91)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await supabase.from("otp_codes").insert({
        phone: cleanPhone,
        otp,
        expires_at: expiresAt,
      });
    } else {
      // localStorage fallback
      const expiresAt = Date.now() + 5 * 60 * 1000;
      setOtpStore((prev) => ({ ...prev, [cleanPhone]: { otp, expiresAt } }));
    }

    console.log(`[AgriNexus OTP] Your OTP for ${phone} is: ${otp}`);
    return otp;
  }, []);

  // ---- Verify OTP ----
  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (isSupabaseConfigured() && supabase) {
      // Check OTP from Supabase
      const { data } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", cleanPhone)
        .eq("otp", otp)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) return false;

      // Mark OTP as verified
      await supabase.from("otp_codes").update({ verified: true }).eq("id", data.id);

      // Check if farmer exists
      const { data: farmer } = await supabase
        .from("farmers")
        .select("*")
        .eq("phone", cleanPhone)
        .single();

      if (farmer) {
        const u: User = {
          id: farmer.id,
          name: farmer.name,
          phone: farmer.phone,
          city: farmer.city,
          state: farmer.state,
          district: farmer.district,
          pincode: farmer.pincode,
          village: farmer.village,
          address: farmer.address,
          role: farmer.role,
          createdAt: farmer.created_at,
        };
        setUser(u);
        localStorage.setItem("agn_current_user", JSON.stringify(u));

        // Log login activity
        await supabase.from("activity_log").insert({
          farmer_id: farmer.id,
          action: "login",
          details: { method: "otp", phone: cleanPhone },
        });

        return true;
      }

      // No farmer record — need to register first
      return false;
    } else {
      // localStorage fallback
      const stored = otpStore[cleanPhone];
      if (!stored) return false;
      if (Date.now() > stored.expiresAt) return false;
      if (stored.otp !== otp) return false;

      setOtpStore((prev) => {
        const next = { ...prev };
        delete next[cleanPhone];
        return next;
      });

      // Find existing user
      const users = getLocalUsers();
      const existing = users.find((u) => u.phone.replace(/\D/g, "") === cleanPhone);
      if (existing) {
        setUser(existing);
        localStorage.setItem("agn_current_user", JSON.stringify(existing));
        return true;
      }
      return false;
    }
  }, [otpStore]);

  // ---- Register ----
  const register = useCallback(async (
    data: Omit<User, "id" | "createdAt"> & { pincode: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = data.phone.replace(/\D/g, "");

    if (isSupabaseConfigured() && supabase) {
      // Check duplicate
      const { data: existing } = await supabase
        .from("farmers")
        .select("id")
        .eq("phone", cleanPhone)
        .single();

      if (existing) {
        return { success: false, error: "This mobile number is already registered. Please login instead." };
      }

      // Insert new farmer
      const { data: newFarmer, error } = await supabase
        .from("farmers")
        .insert({
          phone: cleanPhone,
          name: data.name,
          village: data.village,
          city: data.city,
          state: data.state,
          district: data.district,
          pincode: data.pincode,
          address: data.address,
          role: "FARMER",
        })
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Registration failed. Please try again." };
      }

      const u: User = {
        id: newFarmer.id,
        name: newFarmer.name,
        phone: newFarmer.phone,
        city: newFarmer.city,
        state: newFarmer.state,
        district: newFarmer.district,
        pincode: newFarmer.pincode,
        village: newFarmer.village,
        address: newFarmer.address,
        role: newFarmer.role,
        createdAt: newFarmer.created_at,
      };
      setUser(u);
      localStorage.setItem("agn_current_user", JSON.stringify(u));

      // Log registration
      await supabase.from("activity_log").insert({
        farmer_id: newFarmer.id,
        action: "register",
        details: { name: data.name, city: data.city, state: data.state },
      });

      return { success: true };
    } else {
      // localStorage fallback
      const users = getLocalUsers();
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
      saveLocalUsers(users);
      setUser(newUser);
      localStorage.setItem("agn_current_user", JSON.stringify(newUser));
      return { success: true };
    }
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("agn_current_user");
  }, []);

  // ---- Update Profile ----
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("agn_current_user", JSON.stringify(updated));

    if (isSupabaseConfigured() && supabase) {
      const { id, createdAt: _ca, ...updateData } = updated;
      await supabase
        .from("farmers")
        .update({
          name: updateData.name,
          village: updateData.village,
          city: updateData.city,
          state: updateData.state,
          district: updateData.district,
          pincode: updateData.pincode,
          address: updateData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } else {
      const users = getLocalUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...data };
        saveLocalUsers(users);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
