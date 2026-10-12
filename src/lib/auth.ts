import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Usuario = { id: string; email: string };

/** Usuário logado (validado pelo JWT). Redireciona para /login se não houver sessão. */
export const getUsuario = cache(async (): Promise<Usuario> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/login");

  return { id: claims.sub, email: String(claims.email ?? "") };
});
