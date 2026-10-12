import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { variaveisFaltando } from "@/lib/env";

// Rotas acessíveis sem login.
const PUBLICAS = ["/login"];

/**
 * Renova a sessão do Supabase a cada requisição e manda para /login quem não
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

  // Não coloque código entre createServerClient e getClaims: é aqui que a sessão é renovada.
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
  console.error(`Echo: variáveis de ambiente ausentes: ${faltando.join(", ")}`);

  const itens = faltando.map((nome) => `<li><code>${nome}</code></li>`).join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Configuração incompleta · Echo</title>
<style>
  :root { color-scheme: light dark; --bg: #fff; --fg: #171717; --muted: #666; --code: #f2f2f2; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0a0a0a; --fg: #ededed; --muted: #a3a3a3; --code: #262626; } }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg);
         color: var(--fg); font: 16px/1.5 system-ui, sans-serif; }
  main { max-width: 32rem; padding: 2rem 1rem; }
  h1 { font-size: 1.25rem; margin: 0 0 .5rem; }
  p { color: var(--muted); }
  code { background: var(--code); padding: .1rem .35rem; border-radius: .25rem; }
</style>
</head>
<body>
<main>
  <h1>Echo: configuração incompleta</h1>
  <p>Faltam estas variáveis de ambiente:</p>
  <ul>${itens}</ul>
  <p>Localmente, preencha o <code>.env.local</code> e reinicie o <code>npm run dev</code>.
  Na Vercel, cadastre-as em Settings → Environment Variables e faça um Redeploy
  (as <code>NEXT_PUBLIC_*</code> só entram em um build novo).</p>
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
    // Tudo, exceto arquivos estáticos, imagens e arquivos do PWA.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
