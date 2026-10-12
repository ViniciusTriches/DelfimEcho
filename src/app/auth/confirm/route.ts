import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do magic link. Aceita os dois formatos:
 *  - ?token_hash=…&type=email  (template de e-mail recomendado; funciona abrindo
 *    o link em outro dispositivo/navegador)
 *  - ?code=…                   (template padrão do Supabase, fluxo PKCE; só funciona
 *    no mesmo navegador em que o link foi pedido)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const next = searchParams.get("next") ?? "/";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createClient();

  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  return NextResponse.redirect(new URL(ok ? destino : "/login?erro=link", origin));
}
