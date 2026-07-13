"use server";

import { redirect } from "next/navigation";
import { ensureDefaultCategoriesForUser } from "@/features/categories/queries/get-categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "../utils/get-safe-next-path";

function getLoginErrorPath(error: "missing" | "invalid", nextPath: string) {
  const params = new URLSearchParams({ error, next: nextPath });
  return `/login?${params.toString()}`;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(String(formData.get("next") ?? "/dashboard"));

  if (!email || !password) {
    redirect(getLoginErrorPath("missing", nextPath));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(getLoginErrorPath("invalid", nextPath));
  }

  const profileName =
    typeof data.user.user_metadata.name === "string" && data.user.user_metadata.name.trim()
      ? data.user.user_metadata.name.trim()
      : (data.user.email ?? "사용자");

  await ensureDefaultCategoriesForUser(data.user.id, profileName);

  redirect(nextPath);
}
