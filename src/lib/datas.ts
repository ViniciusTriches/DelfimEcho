// Todas as datas do Echo são interpretadas e exibidas em America/Sao_Paulo,
// independente do fuso do servidor (Vercel roda em UTC) ou do aparelho.

export const FUSO = "America/Sao_Paulo";

const PARTES = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partes(data: Date) {
  const p = Object.fromEntries(PARTES.formatToParts(data).map((x) => [x.type, x.value]));
  return {
    ano: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    hora: Number(p.hour),
    minuto: Number(p.minute),
    segundo: Number(p.second),
  };
}

/** Diferença (ms) entre o horário de São Paulo e UTC naquele instante. */
function deslocamento(data: Date) {
  const p = partes(data);
  const comoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return comoUtc - Math.floor(data.getTime() / 1000) * 1000;
}

const dois = (n: number) => String(n).padStart(2, "0");

/** Date → "AAAA-MM-DDTHH:mm" no horário de São Paulo (valor de <input type="datetime-local">). */
export function paraInputLocal(data: Date): string {
  const p = partes(data);
  return `${p.ano}-${dois(p.mes)}-${dois(p.dia)}T${dois(p.hora)}:${dois(p.minuto)}`;
}

/** "AAAA-MM-DDTHH:mm" no horário de São Paulo → Date. Null se inválido. */
export function deInputLocal(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(valor);
  if (!m) return null;
  const [, a, mes, d, h, min] = m.map(Number);
  const palpite = Date.UTC(a, mes - 1, d, h, min);
  const data = new Date(palpite - deslocamento(new Date(palpite)));
  return Number.isNaN(data.getTime()) ? null : data;
}

const DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "seg., 12 de out., 14:30" */
export function formatarDataHora(iso: string | Date): string {
  return DATA_HORA.format(new Date(iso));
}

/** 75 → "1h15"; 45 → "45 min" */
export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h${dois(m)}`;
}

/** Segundos → "1:05:09" ou "05:09" (cronômetro). */
export function formatarCronometro(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${dois(m)}:${dois(s % 60)}` : `${dois(m)}:${dois(s % 60)}`;
}
