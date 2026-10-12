"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { mensagem: string; codigo?: string } | null;

const MENSAGENS: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Seu e-mail ainda não foi confirmado no Supabase.",
  over_request_rate_limit: "Muitas tentativas. Espere alguns minutos e tente de novo.",
  user_banned: "Este usuário está bloqueado no Supabase.",
};

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const permitido = process.env.ALLOWED_EMAIL?.trim().toLowerCase();

  if (!email || !senha) return { mensagem: "Informe e-mail e senha." };

  // App de um usuário só: outro e-mail recebe a mesma resposta de credencial inválida,
  // sem revelar qual é o e-mail certo.
  if (!permitido || email !== permitido) {
    return { mensagem: MENSAGENS.invalid_credentials, codigo: "invalid_credentials" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    console.error("signInWithPassword:", error.code, error.message);
    const codigo = error.code ?? (error.status === 429 ? "over_request_rate_limit" : "erro_desconhecido");
    return {
      mensagem: MENSAGENS[codigo] ?? "Não foi possível entrar. Tente novamente.",
      codigo,
    };
  }

  redirect("/");
}
