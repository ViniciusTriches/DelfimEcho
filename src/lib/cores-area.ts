// Cores das áreas: o banco guarda um hex por área. Para que a cor acompanhe o tema
// (claro/escuro) e a paleta terrosa, cada hex conhecido vira um token CSS. Nenhum dado
// do banco muda; hexes desconhecidos (cor personalizada) são usados como vieram.

export const SLOTS_AREA = [
  "salvia",
  "terracota",
  "ardosia",
  "mostarda",
  "ameixa",
  "mar",
  "argila",
  "oliva",
] as const;
export type SlotArea = (typeof SLOTS_AREA)[number];

export const NOMES_SLOT: Record<SlotArea, string> = {
  salvia: "Sálvia",
  terracota: "Terracota",
  ardosia: "Ardósia",
  mostarda: "Mostarda",
  ameixa: "Ameixa",
  mar: "Mar",
  argila: "Argila",
  oliva: "Oliva",
};

/** Hex gravado no banco para cada cor nova (o tom do tema claro, gerado em tema.css). */
export const HEX_SLOT: Record<SlotArea, string> = {
  salvia: "#426534",
  terracota: "#b05f32",
  ardosia: "#466890",
  mostarda: "#705200",
  ameixa: "#9c6994",
  mar: "#1d6b6a",
  argila: "#9e5251",
  oliva: "#777525",
};

// Paleta antiga (Fases 1–8) → cor terrosa equivalente.
const LEGADO: Record<string, SlotArea> = {
  "#3b82f6": "ardosia",
  "#0ea5e9": "mar",
  "#14b8a6": "mar",
  "#10b981": "salvia",
  "#84cc16": "oliva",
  "#f59e0b": "mostarda",
  "#f97316": "terracota",
  "#ef4444": "argila",
  "#ec4899": "ameixa",
  "#8b5cf6": "ameixa",
  "#6366f1": "ardosia",
  "#64748b": "ardosia",
};

const POR_HEX: Record<string, SlotArea> = {
  ...LEGADO,
  ...Object.fromEntries(Object.entries(HEX_SLOT).map(([slot, hex]) => [hex, slot as SlotArea])),
};

export function slotDaCor(hex: string | null | undefined): SlotArea | null {
  return hex ? (POR_HEX[hex.toLowerCase()] ?? null) : null;
}

/** Cor da área para CSS (acompanha o tema quando é uma cor conhecida). */
export function corArea(hex: string | null | undefined): string {
  const slot = slotDaCor(hex);
  return slot ? `var(--md-terra-${slot})` : (hex ?? "var(--md-outline)");
}

/** Fundo suave da área (ícones, chips). */
export function corAreaSuave(hex: string | null | undefined): string {
  const slot = slotDaCor(hex);
  return slot ? `var(--md-terra-${slot}-suave)` : `color-mix(in oklab, ${hex ?? "var(--md-outline)"} 18%, transparent)`;
}
