import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  console.warn("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — mode dégradé.");
}

export const hasSupabase = Boolean(url && anon);

export const supabase = createClient(url || "https://placeholder.supabase.co", anon || "public-anon-key", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
