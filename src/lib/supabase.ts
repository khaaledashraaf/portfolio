import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY!;

// Public client — used in server components for public reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — server-only, bypasses RLS, used for writes
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
