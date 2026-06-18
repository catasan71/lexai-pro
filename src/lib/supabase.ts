/**
 * Client Supabase (Auth + DB + Storage).
 *
 * Citește credențialele din variabile de mediu Vite:
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * Cheia `anon` e sigură în frontend — securitatea reală vine din Row-Level
 * Security (vezi `supabase/schema.sql`).
 *
 * Dacă nu sunt setate, `supabase` e `null` și `isSupabaseConfigured` e false,
 * astfel încât aplicația rulează în continuare (funcțiile de cont sunt dezactivate).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
