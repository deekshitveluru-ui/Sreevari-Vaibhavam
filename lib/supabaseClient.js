// lib/supabaseClient.js

// Replace these placeholders with your actual Supabase URL and Anon Public Key
const supabaseUrl = "YOUR_SUPABASE_URL_PLACEHOLDER";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY_PLACEHOLDER";

if (supabaseUrl === "YOUR_SUPABASE_URL_PLACEHOLDER" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY_PLACEHOLDER") {
  console.warn("Supabase credentials not configured. Please replace the placeholders in 'lib/supabaseClient.js' with your active credentials.");
}

// Initialize and export the client using the globally registered Supabase CDN script
export const supabase = window.supabase
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        insert: async () => {
          console.error("Supabase CDN library not loaded.");
          return { data: null, error: new Error("CDN Library Missing") };
        }
      })
    };
