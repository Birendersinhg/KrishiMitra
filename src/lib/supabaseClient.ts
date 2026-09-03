import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[AgriNexus] Supabase credentials not configured. Using localStorage fallback."
    );
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    console.log("[AgriNexus] Supabase connected successfully.");
  }
} catch (err) {
  console.error("[AgriNexus] Failed to initialize Supabase, using localStorage fallback:", err);
  supabase = null;
}

export { supabase };

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
