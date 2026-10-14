// Service worker do Echo (gerado por scripts/gerar-sw.mjs; não edite public/sw.js).
//
// Regra: só arquivos estáticos ficam em cache (JS, CSS, fontes, ícones). Páginas, dados e
// ações sempre vão ao servidor, para nunca mostrar informação desatualizada. Sem internet,
// a navegação cai numa página offline simples.

const VERSAO = "__VERSAO__";
const CACHE = `echo-estaticos-${VERSAO}`;
const OFFLINE = "/offline.html";
const PRECACHE = [OFFLINE, "/icons/icon.svg", "/icons/icon-192.png"];

self.addEventListener("install", (evento) => {
  // Não assume o controle sozinho: a página avisa "Nova versão disponível" e o usuário decide.
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(nomes.filter((n) => n.startsWith("echo-") && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (evento) => {
  if (evento.data?.tipo === "pular-espera") self.skipWaiting();
});

/** Arquivo estático com nome que muda a cada versão (ou ícone): pode vir do cache. */
function estatico(url) {
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/splash/") ||
    /^\/(favicon\.ico|icon\.svg|apple-icon\.png)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (estatico(url)) {
    evento.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const salvo = await cache.match(request);
        if (salvo) return salvo;
        const resposta = await fetch(request);
        if (resposta.ok) cache.put(request, resposta.clone());
        return resposta;
      }),
    );
    return;
  }

  // Navegação: sempre da rede; sem internet, a página offline.
  if (request.mode === "navigate") {
    evento.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE)) ?? Response.error()));
  }
  // O resto (dados, RSC, ações) passa direto, sem cache.
});
