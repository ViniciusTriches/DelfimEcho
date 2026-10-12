"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sair() {
  const supabase = await createClient();
  // "local" encerra só a sessão deste aparelho (o padrão, "global", deslogaria todos).
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
