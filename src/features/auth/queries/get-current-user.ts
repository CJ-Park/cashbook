import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (
    error ||
    typeof data?.claims.sub !== "string" ||
    data.claims.sub.length === 0
  ) {
    return null;
  }

  return {
    id: data.claims.sub,
    email:
      typeof data.claims.email === "string" ? data.claims.email : undefined,
  };
}
