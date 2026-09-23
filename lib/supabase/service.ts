import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ Ne jamais importer ce fichier dans un composant client ("use client")
 * ni exposer SUPABASE_SERVICE_ROLE_KEY au navigateur. Réservé aux Route
 * Handlers (app/api/**) qui ont besoin de contourner RLS ou d'accéder à
 * des fonctions restreintes au service_role (ex: get_secret).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
