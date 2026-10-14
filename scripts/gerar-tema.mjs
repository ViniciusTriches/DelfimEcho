// Gera os tokens de cor do Echo (Material 3) em src/app/tema.css.
//   node scripts/gerar-tema.mjs          → escreve o CSS
//   node scripts/gerar-tema.mjs --relatorio → também imprime contrastes
//
// Duas fontes: primária teal suave e neutro QUENTE (areia). O esquema base vem do
// DynamicScheme do Material 3; as superfícies seguem a direção do Echo: fundo creme e
// containers em areia um pouco mais escuros (claro), café e marrons acinzentados (escuro).
// Nunca #FFFFFF nem #000000: todas as superfícies saem da paleta neutra com croma.

import { writeFileSync } from "node:fs";
import {
  argbFromHex,
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors as C,
  TonalPalette,
  Variant,
} from "@material/material-color-utilities";

const PRIMARIA = "#2F7D74"; // teal suavizado
const AREIA = "#E8DFD0"; // neutro quente

const teal = Hct.fromInt(argbFromHex(PRIMARIA));
const areia = Hct.fromInt(argbFromHex(AREIA));

const paletas = {
  primaryPalette: TonalPalette.fromHueAndChroma(teal.hue, 28), // um pouco menos croma que a fonte: containers calmos
  secondaryPalette: TonalPalette.fromHueAndChroma(teal.hue, 12),
  tertiaryPalette: TonalPalette.fromHueAndChroma(48, 26), // terracota suave, puxada para o quente
  neutralPalette: TonalPalette.fromHueAndChroma(areia.hue, 4), // fundo e tinta (refs: croma 2,4–3,7)
  neutralVariantPalette: TonalPalette.fromHueAndChroma(areia.hue, 8),
  errorPalette: TonalPalette.fromHueAndChroma(30, 44), // vermelho terroso
};

// Containers: a própria areia (croma da fonte), para as camadas lerem como areia/bege.
const AREIA_CLARO = TonalPalette.fromHueAndChroma(areia.hue, areia.chroma);
const AREIA_ESCURO = TonalPalette.fromHueAndChroma(areia.hue, 5);

const esquema = (isDark) =>
  new DynamicScheme({
    sourceColorHct: teal,
    variant: Variant.TONAL_SPOT,
    contrastLevel: 0,
    isDark,
    ...paletas,
  });

const N = paletas.neutralPalette;
const NV = paletas.neutralVariantPalette;
const hex = (argb) => hexFromArgb(argb).toUpperCase();

// Superfícies e tinta (tons da paleta neutra quente), por tema.
const SUPERFICIES = {
  claro: {
    background: N.tone(95.5), // creme
    surface: N.tone(95.5),
    "surface-dim": AREIA_CLARO.tone(87),
    "surface-bright": N.tone(97),
    "surface-container-lowest": N.tone(97.5), // campos e cartões em destaque: claro, nunca branco
    "surface-container-low": AREIA_CLARO.tone(93.5), // areia
    "surface-container": AREIA_CLARO.tone(91.5),
    "surface-container-high": AREIA_CLARO.tone(89.5),
    "surface-container-highest": AREIA_CLARO.tone(87.5), // bege
    "on-surface": N.tone(17), // marrom-acinzentado escuro
    "on-background": N.tone(17),
    "on-surface-variant": NV.tone(32),
    outline: NV.tone(50),
    "outline-variant": NV.tone(80),
    "inverse-surface": N.tone(22),
    "inverse-on-surface": N.tone(94),
    shadow: N.tone(8),
    scrim: N.tone(8),
  },
  escuro: {
    background: N.tone(9.5), // café
    surface: N.tone(9.5),
    "surface-dim": N.tone(9.5),
    "surface-bright": AREIA_ESCURO.tone(24),
    "surface-container-lowest": N.tone(6.5),
    "surface-container-low": AREIA_ESCURO.tone(12.5),
    "surface-container": AREIA_ESCURO.tone(15),
    "surface-container-high": AREIA_ESCURO.tone(18.5),
    "surface-container-highest": AREIA_ESCURO.tone(22.5),
    "on-surface": N.tone(91), // creme
    "on-background": N.tone(91),
    "on-surface-variant": NV.tone(78),
    outline: NV.tone(60),
    "outline-variant": NV.tone(30),
    "inverse-surface": N.tone(90),
    "inverse-on-surface": N.tone(20),
    shadow: N.tone(3),
    scrim: N.tone(3),
  },
};

const PAPEIS = {
  primary: C.primary,
  "on-primary": C.onPrimary,
  "primary-container": C.primaryContainer,
  "on-primary-container": C.onPrimaryContainer,
  "inverse-primary": C.inversePrimary,
  secondary: C.secondary,
  "on-secondary": C.onSecondary,
  "secondary-container": C.secondaryContainer,
  "on-secondary-container": C.onSecondaryContainer,
  tertiary: C.tertiary,
  "on-tertiary": C.onTertiary,
  "tertiary-container": C.tertiaryContainer,
  "on-tertiary-container": C.onTertiaryContainer,
  error: C.error,
  "on-error": C.onError,
  "error-container": C.errorContainer,
  "on-error-container": C.onErrorContainer,
};

// Cores terrosas (áreas, estados e gráficos): mesma família, tons por tema.
// tom claro ≈ 45 (≥3:1 sobre os containers areia); tom escuro ≈ 72 (≥3:1 sobre café).
// Ordem = ordem de atribuição (vizinhos com matizes opostas); [matiz, croma, desvio de tom].
// O desvio alterna a luminosidade para separar vizinhos também em tons de cinza.
const TERROSAS = {
  salvia: [140, 34, +6],
  terracota: [45, 44, -4],
  ardosia: [255, 32, +2], // azul acinzentado
  mostarda: [85, 46, +8],
  ameixa: [335, 34, -6],
  mar: [195, 32, +4], // teal do mar, irmão da primária
  argila: [20, 38, +1], // rosa argila
  oliva: [110, 38, -3],
};
const TOM_TERROSO = { claro: 45, escuro: 72 };

function tokens(tema) {
  const s = esquema(tema === "escuro");
  const t = {};
  for (const [nome, cor] of Object.entries(PAPEIS)) t[nome] = cor.getArgb(s);
  // "On" das cores cheias no claro: o M3 dá branco puro; usamos o creme mais claro da paleta neutra.
  if (tema === "claro") {
    for (const k of ["on-primary", "on-secondary", "on-tertiary", "on-error"]) t[k] = N.tone(98.5);
  }
  // Primary-container mais calmo que o tom 90 de croma 28 (menta vivo demais sobre o creme).
  const containerPrimaria = TonalPalette.fromHueAndChroma(teal.hue, 18);
  t["primary-container"] = containerPrimaria.tone(tema === "claro" ? 88 : 30);
  t["on-primary-container"] = containerPrimaria.tone(tema === "claro" ? 20 : 90);
  for (const [nome, argb] of Object.entries(SUPERFICIES[tema])) t[nome] = argb;
  for (const [nome, [h, c, desvio]] of Object.entries(TERROSAS)) {
    // No escuro o desvio inverte (mais claro = mais destaque sobre café).
    t[`terra-${nome}`] = TonalPalette.fromHueAndChroma(h, c).tone(TOM_TERROSO[tema] + (tema === "claro" ? -desvio : desvio));
    // Fundo suave para chips/ícones de área.
    t[`terra-${nome}-suave`] = TonalPalette.fromHueAndChroma(h, Math.min(c, 16)).tone(tema === "claro" ? 88 : 26);
  }
  // Gráficos: rampas da paleta da primária (uma matiz, claro→escuro), validadas como ordinais.
  const P = paletas.primaryPalette;
  const tonsViz = tema === "claro"
    ? { efetiva: 38, bruta: 66, calor: [68, 54, 40, 26] }
    : { efetiva: 80, bruta: 38, calor: [37, 51, 65, 82] };
  t["viz-efetiva"] = P.tone(tonsViz.efetiva);
  t["viz-bruta"] = P.tone(tonsViz.bruta);
  tonsViz.calor.forEach((tom, i) => (t[`viz-calor-${i + 1}`] = P.tone(tom)));

  // Estados (sempre com ícone + texto): sequência = mostarda, concluído = sálvia, atrasado = terracota.
  t.sequencia = t["terra-mostarda"];
  t.concluido = t["terra-salvia"];
  t.atrasado = t.error;
  return t;
}

const claro = tokens("claro");
const escuro = tokens("escuro");

const bloco = (t) =>
  Object.entries(t)
    .map(([nome, argb]) => `  --md-${nome}: ${hex(argb)};`)
    .join("\n");

const css = `/* Gerado por scripts/gerar-tema.mjs — não edite à mão.
   Material 3 (material-color-utilities): primária ${PRIMARIA}, neutro quente ${AREIA}. */

:root {
  color-scheme: light;
${bloco(claro)}
}

.dark {
  color-scheme: dark;
${bloco(escuro)}
}
`;

writeFileSync(new URL("../src/app/tema.css", import.meta.url), css);
console.log("src/app/tema.css escrito.");

if (process.argv.includes("--relatorio")) {
  const lum = (argb) => {
    const c = [16, 8, 0].map((s) => ((argb >> s) & 255) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contraste = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return ((x + 0.05) / (y + 0.05)).toFixed(2);
  };
  for (const [nome, t] of [["CLARO", claro], ["ESCURO", escuro]]) {
    console.log(`\n== ${nome} ==`);
    const pares = [
      ["on-surface", "surface"],
      ["on-surface", "surface-container-highest"],
      ["on-surface-variant", "surface"],
      ["on-surface-variant", "surface-container-highest"],
      ["primary", "surface"],
      ["primary", "surface-container-high"],
      ["on-primary", "primary"],
      ["on-primary-container", "primary-container"],
      ["on-secondary-container", "secondary-container"],
      ["on-tertiary-container", "tertiary-container"],
      ["error", "surface"],
      ["on-error", "error"],
      ["outline", "surface"],
    ];
    for (const [a, b] of pares) console.log(`${a.padEnd(24)} sobre ${b.padEnd(26)} ${contraste(t[a], t[b])}`);
    for (const nomeT of Object.keys(TERROSAS)) {
      const c = t[`terra-${nomeT}`];
      console.log(
        `terra-${nomeT.padEnd(10)} ${hex(c)}  sobre surface ${contraste(c, t.surface)}  sobre container-highest ${contraste(c, t["surface-container-highest"])}  sobre suave ${contraste(c, t[`terra-${nomeT}-suave`])}`,
      );
    }
    console.log(
      "superfícies:",
      ["background", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest", "on-surface"]
        .map((k) => `${k}=${hex(t[k])}`)
        .join("  "),
    );
    console.log("primária:", ["primary", "on-primary", "primary-container", "on-primary-container", "secondary-container", "tertiary", "error"].map((k) => `${k}=${hex(t[k])}`).join("  "));
  }
}
