// Calendário de planejamento: ocorrências de blocos (séries semanais geradas na leitura),
// conversões de horário em São Paulo e disposição de eventos sobrepostos.

import { deInputLocal, paraInputLocal, somarDias } from "@/lib/datas";

export type Visao = "dia" | "semana" | "mes";
export const VISOES: { valor: Visao; nome: string }[] = [
  { valor: "dia", nome: "Dia" },
  { valor: "semana", nome: "Semana" },
  { valor: "mes", nome: "Mês" },
];

export const NOMES_DIA_CURTO = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const HORA_INICIO_PADRAO = 5;
export const HORA_FIM_PADRAO = 23;
/** Passo de encaixe ao criar, arrastar e redimensionar (minutos). */
export const PASSO = 15;

const dois = (n: number) => String(n).padStart(2, "0");

/** Dia da semana ISO (1 = segunda … 7 = domingo) de "AAAA-MM-DD". */
export function diaIso(dia: string): number {
  return ((new Date(`${dia}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
}

/** Instante → dia e minuto do dia em São Paulo. */
export function localSP(instante: string | Date): { dia: string; minuto: number } {
  const t = paraInputLocal(typeof instante === "string" ? new Date(instante) : instante);
  return { dia: t.slice(0, 10), minuto: Number(t.slice(11, 13)) * 60 + Number(t.slice(14, 16)) };
}

/** "HH:mm" de um minuto do dia (aceita 1440 = "24:00"). */
export function formatarMinuto(minuto: number): string {
  return `${dois(Math.floor(minuto / 60))}:${dois(minuto % 60)}`;
}

/** Dia + minuto em São Paulo → instante. */
export function instanteSP(dia: string, minuto: number): Date {
  if (minuto >= 1440) return instanteSP(somarDias(dia, 1), minuto - 1440);
  return deInputLocal(`${dia}T${formatarMinuto(minuto)}`)!;
}

export function encaixar(minuto: number, passo = PASSO): number {
  return Math.round(minuto / passo) * passo;
}

// ---------------------------------------------------------------------------
// Blocos planejados → ocorrências
// ---------------------------------------------------------------------------

export type BlocoBanco = {
  id: string;
  skill_id: string;
  inicio: string;
  fim: string;
  observacao: string | null;
  repete_dias: number[] | null;
  repete_ate: string | null;
  datas_excluidas: string[];
};

export type Ocorrencia = {
  /** blocoId + data: identifica a ocorrência na tela. */
  chave: string;
  blocoId: string;
  /** Dia (São Paulo) desta ocorrência. */
  data: string;
  inicio: string;
  fim: string;
  skillId: string;
  observacao: string | null;
  serie: boolean;
  /** Dia da primeira ocorrência da série (ou do bloco avulso). */
  primeiraData: string;
  repeteDias: number[] | null;
  repeteAte: string | null;
};

/** Ocorrências dos blocos que começam entre os dias `de` e `ate` (inclusive). */
export function expandirBlocos(blocos: BlocoBanco[], de: string, ate: string): Ocorrencia[] {
  const saida: Ocorrencia[] = [];
  for (const b of blocos) {
    const primeiro = localSP(b.inicio);
    const duracao = new Date(b.fim).getTime() - new Date(b.inicio).getTime();
    const base = {
      blocoId: b.id,
      skillId: b.skill_id,
      observacao: b.observacao,
      primeiraData: primeiro.dia,
      repeteDias: b.repete_dias,
      repeteAte: b.repete_ate,
    };

    if (!b.repete_dias?.length) {
      if (primeiro.dia >= de && primeiro.dia <= ate) {
        saida.push({ ...base, chave: `${b.id}:${primeiro.dia}`, data: primeiro.dia, inicio: b.inicio, fim: b.fim, serie: false });
      }
      continue;
    }

    const excluidas = new Set(b.datas_excluidas);
    const fimSerie = b.repete_ate && b.repete_ate < ate ? b.repete_ate : ate;
    for (let dia = primeiro.dia > de ? primeiro.dia : de; dia <= fimSerie; dia = somarDias(dia, 1)) {
      if (!b.repete_dias.includes(diaIso(dia)) || excluidas.has(dia)) continue;
      const inicio = instanteSP(dia, primeiro.minuto);
      saida.push({
        ...base,
        chave: `${b.id}:${dia}`,
        data: dia,
        inicio: inicio.toISOString(),
        fim: new Date(inicio.getTime() + duracao).toISOString(),
        serie: true,
      });
    }
  }
  return saida.sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/** Descrição curta da repetição ("Ter, Qua e Sex até 20/12"). */
export function descreverRepeticao(dias: number[] | null, ate: string | null): string | null {
  if (!dias?.length) return null;
  const ordenados = [...dias].sort((a, b) => a - b);
  const nomes =
    ordenados.length === 7
      ? "Todos os dias"
      : ordenados.map((d) => NOMES_DIA_CURTO[d - 1]).join(", ").replace(/, ([^,]*)$/, " e $1");
  return ate ? `${nomes} até ${ate.slice(8, 10)}/${ate.slice(5, 7)}` : `${nomes}, toda semana`;
}

// ---------------------------------------------------------------------------
// Grade: eventos sobrepostos lado a lado
// ---------------------------------------------------------------------------

export type Posicionado<T> = T & { ini: number; fimMin: number; coluna: number; colunas: number };

/**
 * Distribui eventos de um dia em colunas: cada grupo de eventos que se sobrepõem
 * divide a largura igualmente, e cada evento fica na primeira coluna livre.
 */
export function dispor<T>(itens: (T & { ini: number; fimMin: number })[]): Posicionado<T>[] {
  const ordenados = [...itens].sort((a, b) => a.ini - b.ini || b.fimMin - a.fimMin);
  const saida: Posicionado<T>[] = [];
  let grupo: Posicionado<T>[] = [];
  let finsColunas: number[] = [];
  let fimGrupo = -1;

  const fechar = () => {
    grupo.forEach((g) => (g.colunas = finsColunas.length));
    saida.push(...grupo);
    grupo = [];
    finsColunas = [];
  };

  for (const item of ordenados) {
    if (item.ini >= fimGrupo && grupo.length) fechar();
    let coluna = finsColunas.findIndex((f) => f <= item.ini);
    if (coluna === -1) {
      coluna = finsColunas.length;
      finsColunas.push(item.fimMin);
    } else finsColunas[coluna] = item.fimMin;
    grupo.push({ ...item, coluna, colunas: 1 });
    fimGrupo = Math.max(fimGrupo, item.fimMin);
  }
  if (grupo.length) fechar();
  return saida;
}

/** Minutos de um evento dentro de um dia (corta o que passa da meia-noite). */
export function minutosNoDia(inicio: string, fim: string, dia: string): { ini: number; fimMin: number } | null {
  const a = localSP(inicio);
  const b = localSP(fim);
  if (a.dia > dia || b.dia < dia) return null;
  const ini = a.dia < dia ? 0 : a.minuto;
  const fimMin = b.dia > dia ? 1440 : b.minuto;
  return fimMin > ini ? { ini, fimMin } : null;
}

/** Dias da grade do mês (segunda antes do dia 1 até o domingo depois do último dia). */
export function diasDaGradeMes(mes: string): string[] {
  const primeiro = `${mes}-01`;
  const inicio = somarDias(primeiro, -(diaIso(primeiro) - 1));
  const [a, m] = mes.split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
  const fim = somarDias(ultimo, 7 - diaIso(ultimo));
  const dias: string[] = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) dias.push(d);
  return dias;
}
