import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do magic link.
 *
 * Com o template padrão do Supabase ({{ .ConfirmationURL }}) o link passa pelo
 * Supabase e volta aqui com ?code=… (fluxo PKCE). O code é trocado pela sessão
 * usando o "code verifier" que ficou num cookie quando o link foi pedido — por isso
 * o link precisa ser aberto no mesmo navegador.
 *
 * Também aceita ?token_hash=…&type=… (caso um dia o template seja customizado).
 * Se o Supabase devolver um erro (?error_code=…), ele é repassado para o /login.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = searchParams.get("next") ?? "/";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  let motivo = searchParams.get("error_code") ?? searchParams.get("error");

  if (!motivo) {
    if (code || (tokenHash && type)) {
      const supabase = await createClient();
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

      if (!error) return NextResponse.redirect(new URL(destino, origin));

      console.error("auth/confirm:", error.code, error.message);
      motivo = error.code ?? "erro_desconhecido";
    } else {
      motivo = "sem_codigo";
    }
  }

  const url = new URL("/login", origin);
  url.searchParams.set("erro", motivo);
  return NextResponse.redirect(url);
}
