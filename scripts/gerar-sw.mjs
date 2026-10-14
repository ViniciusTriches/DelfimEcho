// Gera public/sw.js com a versão deste build. Uma versão nova muda o arquivo, o navegador
// instala o service worker novo e o app avisa "Nova versão disponível".
// Na Vercel, a versão é o commit; localmente, a hora do build.

import { readFileSync, writeFileSync } from "node:fs";

const versao = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 12) || `local-${Date.now().toString(36)}`;
const modelo = readFileSync("scripts/sw.template.js", "utf8");
writeFileSync("public/sw.js", modelo.replace("__VERSAO__", versao));
console.log(`public/sw.js gerado (versão ${versao}).`);
