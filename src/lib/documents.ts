/**
 * Persistența documentelor (istoric) în Supabase.
 *
 * Salvarea e „best-effort": dacă userul nu e logat sau Supabase nu e
 * configurat, funcțiile nu fac nimic (nu blochează generarea).
 */
import { supabase } from "./supabase";

export type DocumentKind = "contract" | "email" | "analysis";

export interface DocumentRow {
  id: string;
  user_id: string;
  kind: DocumentKind;
  title: string;
  content: unknown;
  created_at: string;
}

/** Salvează un document în istoric. Întoarce true dacă a fost salvat. */
export async function saveDocument(
  kind: DocumentKind,
  title: string,
  content: unknown
): Promise<boolean> {
  if (!supabase) return false;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return false;
  const { error } = await supabase
    .from("documents")
    .insert({ user_id: uid, kind, title: title.slice(0, 200), content });
  if (error) {
    console.error("saveDocument:", error.message);
    return false;
  }
  return true;
}

/** Listează documentele userului curent (cele mai noi primele). */
export async function listDocuments(kind?: DocumentKind): Promise<DocumentRow[]> {
  if (!supabase) return [];
  let q = supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) {
    console.error("listDocuments:", error.message);
    return [];
  }
  return (data as DocumentRow[]) ?? [];
}

/** Șterge un document din istoric. */
export async function deleteDocument(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    console.error("deleteDocument:", error.message);
    return false;
  }
  return true;
}
