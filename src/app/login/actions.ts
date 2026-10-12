"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = { ok: boolean; mensagem: string } | null;

export async function enviarMagicLink(
  _anterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const permitido = process.env.ALLOWED_EMAIL?.trim().toLowerCase();

  if (!email) return { ok: false, mensagem: "Informe seu e-mail." };

  // App de um usuário só: qualquer outro e-mail recebe a mesma resposta,
  // sem revelar se é o e-mail certo.
  if (!permitido || email !== permitido) {
    return { ok: true, mensagem: "Se este e-mail tiver acesso, o link chegará em instantes." };
  }

  const h = await headers();
  const origem =
    process.env.NEXT_PUBLIC_SITE_URL ??
    h.get("origin") ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // O usuário é criado pelo seed; o login nunca cria contas.
    options: { emailRedirectTo: `${origem}/auth/confirm`, shouldCreateUser: false },
  });

  if (error) {
    console.error("signInWithOtp:", error.message);
    const limite = error.status === 429;
    return {
      ok: false,
      mensagem: limite
        ? "Muitas tentativas. Espere um pouco e tente de novo."
        : "Não foi possível enviar o link. Tente novamente.",
    };
  }

  return { ok: true, mensagem: "Se este e-mail tiver acesso, o link chegará em instantes." };
}
