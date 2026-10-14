import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { variaveisFaltando } from "@/lib/env";

// Rotas acessÃ­veis sem login.
const PUBLICAS = ["/login"];

/**
 * Renova a sessÃ£o do Supabase a cada requisiÃ§Ã£o e manda para /login quem nÃ£o
 * estiver autenticado.
 */
export async function proxy(request: NextRequest) {
  const faltando = variaveisFaltando();
  if (faltando.length) return paginaErroConfiguracao(faltando);

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // NÃ£o coloque cÃ³digo entre createServerClient e getClaims: Ã© aqui que a sessÃ£o Ã© renovada.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const publica = PUBLICAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!logado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (logado && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

function paginaErroConfiguracao(faltando: string[]) {
  console.error(`Echo: variÃ¡veis de ambiente ausentes: ${faltando.join(", ")}`);

  const itens = faltando.map((nome) => `<li><code>${nome}</code></li>`).join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ConfiguraÃ§Ã£o incompleta Â· Echo</title>
<style>
  :root { color-scheme: light dark; --bg: #F8F1E8; --fg: #2D2A24; --muted: #514B3D; --code: #EFE6D7; }
  @media (prefers-color-scheme: dark) { :root { --bg: #1D1A15; --fg: #EBE4DB; --muted: #C9C0AF; --code: #29251E; } }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg);
         color: var(--fg); font: 16px/1.5 Roboto, system-ui, sans-serif; }
  main { max-width: 32rem; padding: 2rem 1rem; }
  h1 { font-size: 1.375rem; line-height: 1.75rem; font-weight: 400; margin: 0 0 .5rem; }
  p { color: var(--muted); }
  code { background: var(--code); padding: .1rem .35rem; border-radius: 8px; }
</style>
</head>
<body>
<main>
  <h1>Echo: configuraÃ§Ã£o incompleta</h1>
  <p>Faltam estas variÃ¡veis de ambiente:</p>
  <ul>${itens}</ul>
  <p>Localmente, preencha o <code>.env.local</code> e reinicie o <code>npm run dev</code>.
  Na Vercel, cadastre-as em Settings â†’ Environment Variables e faÃ§a um Redeploy
  (as <code>NEXT_PUBLIC_*</code> sÃ³ entram em um build novo).</p>
</main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos estÃ¡ticos, imagens e arquivos do PWA.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
