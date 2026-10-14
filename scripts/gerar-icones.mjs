// Gera os ícones do PWA a partir da marca do Echo (o ponto que emite e os três arcos do
// eco, cada um mais fraco que o anterior). SVG → PNG com o Chrome em modo headless.
//
//   npm run icones            (usa o Chrome instalado; outro caminho: CHROME=/caminho)
//
// Saída: public/icons/*.png|svg, src/app/icon.svg, src/app/apple-icon.png, src/app/favicon.ico
// e public/splash/*.png (telas de abertura do iPhone).

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

// Paleta (tema claro, src/app/tema.css)
const PRIMARIA = "#2D6860";
const CREME = "#F8F1E8";
const CONTAINER = "#C3E4DD"; // primary-container
const NO_CONTAINER = "#173531"; // on-primary-container

// Marca em 24×24 (a mesma de src/components/logo.tsx). Centro visual em (13, 12).
const ARCOS = ["M10 7.5a6.5 6.5 0 0 1 0 9", "M14 4.5a10.5 10.5 0 0 1 0 15", "M18 2a14 14 0 0 1 0 20"];
const OPACIDADE = [1, 0.74, 0.5]; // o eco perde força a cada onda

function marca(lado, escala, cor) {
  const tx = lado / 2 - 13 * escala;
  const ty = lado / 2 - 12 * escala;
  const arcos = ARCOS.map(
    (d, i) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="2.1" stroke-linecap="round" opacity="${OPACIDADE[i]}"/>`,
  ).join("");
  return `<g transform="translate(${tx} ${ty}) scale(${escala})"><circle cx="5" cy="12" r="2.4" fill="${cor}"/>${arcos}</g>`;
}

const svg = (lado, corpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${corpo}</svg>`;

/** "any": quadrado arredondado (cantos transparentes), marca a 56% da altura. */
const iconeQualquer = (lado) =>
  svg(lado, `<rect width="${lado}" height="${lado}" rx="${lado * 0.225}" fill="${PRIMARIA}"/>${marca(lado, (0.56 * lado) / 22, CREME)}`);

/** "maskable": fundo até a borda, marca dentro da zona segura (círculo de 40% do lado). */
const iconeMascaravel = (lado) =>
  svg(lado, `<rect width="${lado}" height="${lado}" fill="${PRIMARIA}"/>${marca(lado, (0.42 * lado) / 22, CREME)}`);

/** iPhone: fundo até a borda (o iOS arredonda os cantos). */
const iconeApple = (lado) =>
  svg(lado, `<rect width="${lado}" height="${lado}" fill="${PRIMARIA}"/>${marca(lado, (0.5 * lado) / 22, CREME)}`);

// Atalhos (pressionar o ícone no Android): glifos do Lucide sobre o primary-container.
const GLIFOS = {
  registrar: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  calendario: `<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>`,
  timer: `<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>`,
  habitos: `<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>`,
};
const iconeAtalho = (lado, glifo) => {
  const k = (0.42 * lado) / 24;
  const t = lado / 2 - 12 * k;
  return svg(
    lado,
    `<rect width="${lado}" height="${lado}" fill="${CONTAINER}"/><g transform="translate(${t} ${t}) scale(${k})" fill="none" stroke="${NO_CONTAINER}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glifo}</g>`,
  );
};

// Tela de abertura do iPhone: creme, com o ícone no centro.
const splash = (l, a) => {
  const lado = Math.round(Math.min(l, a) * 0.28);
  const x = (l - lado) / 2;
  const y = (a - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${a}" viewBox="0 0 ${l} ${a}"><rect width="${l}" height="${a}" fill="${CREME}"/><g transform="translate(${x} ${y})">${iconeQualquer(lado).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`;
};

// Tamanhos físicos (px) e pontos CSS dos iPhones com tela de abertura própria.
export const SPLASH = [
  [1320, 2868, 440, 956],
  [1206, 2622, 402, 874],
  [1290, 2796, 430, 932],
  [1179, 2556, 393, 852],
  [1284, 2778, 428, 926],
  [1170, 2532, 390, 844],
  [1125, 2436, 375, 812],
  [1242, 2688, 414, 896],
  [828, 1792, 414, 896],
  [1242, 2208, 414, 736],
  [750, 1334, 375, 667],
  [640, 1136, 320, 568],
];

const temp = join(tmpdir(), "echo-icones");
rmSync(temp, { recursive: true, force: true });
mkdirSync(temp, { recursive: true });
mkdirSync("public/icons", { recursive: true });
mkdirSync("public/splash", { recursive: true });

/** Rasteriza um SVG no tamanho exato (fundo transparente onde o SVG não pinta). */
function png(conteudo, l, a, destino) {
  const html = join(temp, "pagina.html");
  writeFileSync(
    html,
    `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${conteudo}</body></html>`,
  );
  execFileSync(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    `--window-size=${l},${a}`,
    `--screenshot=${resolve(destino)}`,
    pathToFileURL(html).href,
  ], { stdio: "ignore" });
}

// PWA
png(iconeQualquer(192), 192, 192, "public/icons/icon-192.png");
png(iconeQualquer(512), 512, 512, "public/icons/icon-512.png");
png(iconeMascaravel(192), 192, 192, "public/icons/maskable-192.png");
png(iconeMascaravel(512), 512, 512, "public/icons/maskable-512.png");
writeFileSync("public/icons/icon.svg", iconeQualquer(512));
for (const [nome, glifo] of Object.entries(GLIFOS)) png(iconeAtalho(96, glifo), 96, 96, `public/icons/atalho-${nome}.png`);

// Convenções do Next (app/): favicon, ícone SVG e apple-touch-icon
writeFileSync("src/app/icon.svg", iconeQualquer(64));
png(iconeApple(180), 180, 180, "src/app/apple-icon.png");

// favicon.ico com PNGs de 16, 32 e 48 px dentro
const tamanhos = [16, 32, 48];
const pngs = tamanhos.map((t) => {
  const destino = join(temp, `fav-${t}.png`);
  png(iconeQualquer(t), t, t, destino);
  return readFileSync(destino);
});
const cabecalho = Buffer.alloc(6 + 16 * pngs.length);
cabecalho.writeUInt16LE(0, 0);
cabecalho.writeUInt16LE(1, 2);
cabecalho.writeUInt16LE(pngs.length, 4);
let deslocamento = cabecalho.length;
pngs.forEach((p, i) => {
  const o = 6 + 16 * i;
  cabecalho.writeUInt8(tamanhos[i] % 256, o);
  cabecalho.writeUInt8(tamanhos[i] % 256, o + 1);
  cabecalho.writeUInt16LE(1, o + 4);
  cabecalho.writeUInt16LE(32, o + 6);
  cabecalho.writeUInt32LE(p.length, o + 8);
  cabecalho.writeUInt32LE(deslocamento, o + 12);
  deslocamento += p.length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([cabecalho, ...pngs]));

// Telas de abertura do iPhone
for (const [l, a] of SPLASH) png(splash(l, a), l, a, `public/splash/splash-${l}x${a}.png`);

// Prévia (não vai para o app): todas as variantes lado a lado
const previa = [
  ["any 512", iconeQualquer(160)],
  ["maskable 512 (recorte em círculo)", `<div style="width:160px;height:160px;border-radius:50%;overflow:hidden">${iconeMascaravel(160)}</div>`],
  ["iPhone 180", `<div style="width:160px;height:160px;border-radius:36px;overflow:hidden">${iconeApple(160)}</div>`],
  ["favicon 32", `<div style="transform:scale(1)">${iconeQualquer(32)}</div>`],
  ...Object.entries(GLIFOS).map(([n, g]) => [`atalho ${n}`, `<div style="width:96px;height:96px;border-radius:50%;overflow:hidden">${iconeAtalho(96, g)}</div>`]),
];
writeFileSync(
  join(temp, "previa.html"),
  `<!doctype html><html><body style="margin:0;padding:32px;background:${CREME};font:14px system-ui;color:#2D2A24;display:flex;flex-wrap:wrap;gap:28px;align-items:flex-end">${previa
    .map(([r, s]) => `<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:10px">${s}<figcaption>${r}</figcaption></figure>`)
    .join("")}<figure style="margin:0;display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px;background:#1D1A15;border-radius:24px">${iconeQualquer(96)}<figcaption style="color:#EBE4DB">no fundo escuro</figcaption></figure></body></html>`,
);
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1100,520", `--screenshot=${process.env.PREVIA ?? join(temp, "previa.png")}`, pathToFileURL(join(temp, "previa.html")).href], { stdio: "ignore" });
console.log("Ícones gerados.", process.env.PREVIA ? `Prévia: ${process.env.PREVIA}` : "");
