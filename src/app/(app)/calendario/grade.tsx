"use client";

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FlagIcon, MilestoneIcon, RepeatIcon } from "lucide-react";
import * as m from "motion/react-m";
import Link from "next/link";
import { EASE } from "@/components/movimento";
import {
  dispor,
  encaixar,
  formatarMinuto,
  instanteSP,
  localSP,
  minutosNoDia,
  NOMES_DIA_CURTO,
  PASSO,
} from "@/lib/calendario";
import { corArea, corAreaSuave } from "@/lib/cores-area";
import { cn } from "@/lib/utils";
import type { BlocoCal, DiaInteiro, HabilidadeCal, SessaoCal } from "./dados";

export type Evento = BlocoCal | SessaoCal;
type Faixa = { inicio: number; fim: number };

// Hora atual, com troca a cada minuto (checa a cada 15 s). Só no navegador: no servidor
// a linha do "agora" não aparece, então não há diferença de hidratação.
const inscreverMinuto = (aviso: () => void) => {
  const id = setInterval(aviso, 15_000);
  return () => clearInterval(id);
};
const minutoAtual = () => Math.floor(Date.now() / 60_000);
export function useAgoraMinuto(): Date | null {
  const minuto = useSyncExternalStore(inscreverMinuto, minutoAtual, () => null);
  return minuto === null ? null : new Date(minuto * 60_000);
}

type Arraste =
  | { tipo: "selecao"; dia: string; a: number; b: number }
  | { tipo: "mover"; bloco: BlocoCal; dia: string; ini: number; dur: number; pega: number; moveu: boolean }
  | { tipo: "duracao"; bloco: BlocoCal; dia: string; ini: number; fim: number; moveu: boolean };

export function Grade({
  dias,
  hoje,
  eventos,
  diaInteiro,
  habilidades,
  faixa,
  compacto = false,
  troca,
  aoCriar,
  aoAbrir,
  aoMover,
}: {
  dias: string[];
  hoje: string;
  eventos: Evento[];
  diaInteiro: DiaInteiro[];
  habilidades: Map<string, HabilidadeCal>;
  faixa: Faixa;
  /** Semana no celular: colunas estreitas, só o nome da habilidade. */
  compacto?: boolean;
  /** Visão Dia: ao trocar de dia, os eventos entram deslizando na direção da troca. */
  troca?: { chave: string; direcao: number };
  aoCriar: (dia: string, ini: number, fim: number) => void;
  aoAbrir: (evento: Evento) => void;
  aoMover: (bloco: BlocoCal, inicio: Date, fim: Date) => void;
}) {
  const agora = useAgoraMinuto();
  const rolagem = useRef<HTMLDivElement>(null);
  const colunas = useRef(new Map<string, HTMLDivElement>());
  const ignorarClique = useRef(false);
  const [arraste, setArraste] = useState<Arraste | null>(null);

  // Eventos de cada dia, já com posição; a faixa cresce se algo cair fora dela.
  const porDia = useMemo(() => {
    const mapa = new Map<string, ReturnType<typeof dispor<{ evento: Evento }>>>();
    for (const dia of dias) {
      const doDia = eventos.flatMap((evento) => {
        const m = minutosNoDia(evento.inicio, evento.fim, dia);
        return m ? [{ evento, ...m }] : [];
      });
      mapa.set(dia, dispor(doDia));
    }
    return mapa;
  }, [dias, eventos]);

  const { ini: iniFaixa, fim: fimFaixa } = useMemo(() => {
    let ini = faixa.inicio * 60;
    let fim = faixa.fim * 60;
    porDia.forEach((lista) =>
      lista.forEach((e) => {
        ini = Math.min(ini, Math.floor(e.ini / 60) * 60);
        fim = Math.max(fim, Math.ceil(e.fimMin / 60) * 60);
      }),
    );
    return { ini, fim };
  }, [faixa, porDia]);
  const horas = Array.from({ length: (fimFaixa - iniFaixa) / 60 }, (_, i) => iniFaixa / 60 + i);
  const pct = (minuto: number) => ((minuto - iniFaixa) / (fimFaixa - iniFaixa)) * 100;

  // Ao abrir: rola até o horário atual (ou o início da faixa).
  useLayoutEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    const alvo = localSP(new Date()).minuto;
    const fracao = Math.min(1, Math.max(0, (alvo - iniFaixa) / (fimFaixa - iniFaixa)));
    el.scrollTop = Math.max(0, fracao * el.scrollHeight - el.clientHeight / 3);
    // Só na montagem: depois, quem rola é o usuário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Ponteiro → dia e minuto da grade (encaixado no passo). */
  function ponto(clientX: number, clientY: number, diaPadrao: string) {
    let dia = diaPadrao;
    let rect = colunas.current.get(diaPadrao)?.getBoundingClientRect();
    colunas.current.forEach((el, d) => {
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX < r.right) {
        dia = d;
        rect = r;
      }
    });
    if (!rect) return { dia, minuto: iniFaixa };
    const bruto = iniFaixa + ((clientY - rect.top) / rect.height) * (fimFaixa - iniFaixa);
    return { dia, minuto: Math.min(fimFaixa, Math.max(iniFaixa, bruto)) };
  }

  // --- Coluna vazia: tocar cria 1 h; no PC, arrastar seleciona o intervalo -----------
  function aoPressionarColuna(e: React.PointerEvent<HTMLDivElement>, dia: string) {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target !== e.currentTarget) return;
    const m = encaixar(ponto(e.clientX, e.clientY, dia).minuto - PASSO / 2);
    e.currentTarget.setPointerCapture(e.pointerId);
    setArraste({ tipo: "selecao", dia, a: m, b: m });
  }

  function aoMoverPonteiro(e: React.PointerEvent) {
    if (!arraste) return;
    const p = ponto(e.clientX, e.clientY, arraste.dia);
    if (arraste.tipo === "selecao") {
      setArraste({ ...arraste, b: encaixar(ponto(e.clientX, e.clientY, arraste.dia).minuto) });
    } else if (arraste.tipo === "mover") {
      const ini = Math.min(fimFaixa - arraste.dur, Math.max(iniFaixa, encaixar(p.minuto - arraste.pega)));
      if (ini !== arraste.ini || p.dia !== arraste.dia) setArraste({ ...arraste, dia: p.dia, ini, moveu: true });
    } else {
      const fim = Math.max(arraste.ini + PASSO, encaixar(p.minuto));
      if (fim !== arraste.fim) setArraste({ ...arraste, fim, moveu: true });
    }
  }

  function aoSoltar() {
    if (!arraste) return;
    setArraste(null);
    if (arraste.tipo === "selecao") {
      ignorarClique.current = true;
      const a = Math.min(arraste.a, arraste.b);
      const b = Math.max(arraste.a, arraste.b);
      aoCriar(arraste.dia, a, b - a >= PASSO ? b : Math.min(1440, a + 60));
      return;
    }
    if (!arraste.moveu) return; // foi um clique: o onClick abre os detalhes
    ignorarClique.current = true;
    const ini = arraste.ini;
    const fim = arraste.tipo === "mover" ? arraste.ini + arraste.dur : arraste.fim;
    aoMover(arraste.bloco, instanteSP(arraste.dia, ini), instanteSP(arraste.dia, fim));
  }

  function aoClicarColuna(e: React.MouseEvent<HTMLDivElement>, dia: string) {
    if (ignorarClique.current) {
      ignorarClique.current = false;
      return;
    }
    if (e.target !== e.currentTarget) return;
    const ini = Math.max(iniFaixa, encaixar(ponto(e.clientX, e.clientY, dia).minuto - 30, 30));
    aoCriar(dia, ini, Math.min(1440, ini + 60));
  }

  // --- Bloco: arrastar move; a borda de baixo muda a duração (só com mouse) ----------
  function aoPressionarBloco(e: React.PointerEvent, bloco: BlocoCal, dia: string, ini: number, fim: number, borda: boolean) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (borda) setArraste({ tipo: "duracao", bloco, dia, ini, fim, moveu: false });
    else {
      const pega = ponto(e.clientX, e.clientY, dia).minuto - ini;
      setArraste({ tipo: "mover", bloco, dia, ini, dur: fim - ini, pega, moveu: false });
    }
  }

  function aoClicarEvento(e: React.MouseEvent, evento: Evento) {
    e.stopPropagation();
    if (ignorarClique.current) {
      ignorarClique.current = false;
      return;
    }
    aoAbrir(evento);
  }

  const agoraSP = agora ? localSP(agora) : null;
  const umDia = dias.length === 1;

  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-low">
      <div
        ref={rolagem}
        className="relative max-h-[calc(100dvh-15rem)] min-h-80 overflow-y-auto overscroll-contain [--hora-cal:3rem] md:max-h-[calc(100dvh-13rem)] md:[--hora-cal:3.5rem]"
      >
        {/* Cabeçalho: dias + faixa de dia inteiro (metas e marcos) */}
        <div className="sticky top-0 z-20 grid border-b border-outline-variant bg-surface-container-low" style={{ gridTemplateColumns: colunasGrade(dias.length, compacto) }}>
          <div />
          {dias.map((dia) => {
            const eHoje = dia === hoje;
            const doDia = diaInteiro.filter((d) => d.data === dia);
            const semana = new Date(`${dia}T00:00:00Z`).getUTCDay();
            return (
              <div key={dia} className={cn("flex min-w-0 flex-col items-center gap-1 border-l border-outline-variant px-1 pt-2 pb-1.5", umDia && "items-start px-3")}>
                <div className={cn("flex items-center gap-2", !umDia && "flex-col gap-1")}>
                  <span className="type-label-medium text-on-surface-variant">{NOMES_DIA_CURTO[(semana + 6) % 7]}</span>
                  <span
                    className={cn(
                      "numero flex size-8 items-center justify-center rounded-full type-title-medium",
                      eHoje ? "bg-primary text-on-primary" : "text-on-surface",
                    )}
                    aria-current={eHoje ? "date" : undefined}
                  >
                    {Number(dia.slice(8, 10))}
                  </span>
                </div>
                {doDia.length > 0 && (
                  <ul className="flex w-full min-w-0 flex-col gap-1">
                    {doDia.map((d) => (
                      <li key={`${d.tipo}-${d.id}`} className="min-w-0">
                        <Link
                          href={d.href}
                          title={`${d.tipo === "meta" ? "Prazo da meta" : "Marco"}: ${d.titulo}`}
                          aria-label={`${d.tipo === "meta" ? "Prazo da meta" : "Marco"}: ${d.titulo}`}
                          className={cn(
                            "camada-estado flex min-h-6 min-w-0 items-center gap-1 rounded-sm px-1.5 type-label-medium",
                            d.tipo === "meta"
                              ? "bg-tertiary-container text-on-tertiary-container"
                              : "bg-secondary-container text-on-secondary-container",
                            compacto && "justify-center px-0",
                          )}
                        >
                          {d.tipo === "meta" ? (
                            <FlagIcon className="size-3.5 shrink-0" aria-hidden />
                          ) : (
                            <MilestoneIcon className="size-3.5 shrink-0" aria-hidden />
                          )}
                          {!compacto && <span className="truncate" aria-hidden>{d.titulo}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Corpo: horários + colunas */}
        <div
          className="relative grid"
          style={{ gridTemplateColumns: colunasGrade(dias.length, compacto), height: `calc(${horas.length} * var(--hora-cal))` }}
        >
          <div className="relative" aria-hidden>
            {horas.map((h, i) =>
              i === 0 ? null : (
                <span
                  key={h}
                  className="numero absolute right-1.5 -translate-y-1/2 type-label-medium text-on-surface-variant sm:right-2"
                  style={{ top: `${(i / horas.length) * 100}%` }}
                >
                  {compacto ? String(h).padStart(2, "0") : `${String(h).padStart(2, "0")}:00`}
                </span>
              ),
            )}
          </div>

          {dias.map((dia) => {
            const fimDeSemana = [0, 6].includes(new Date(`${dia}T00:00:00Z`).getUTCDay());
            const lista = porDia.get(dia) ?? [];
            return (
              <div
                key={dia}
                ref={(el) => {
                  if (el) colunas.current.set(dia, el);
                  else colunas.current.delete(dia);
                }}
                onPointerDown={(e) => aoPressionarColuna(e, dia)}
                onPointerMove={aoMoverPonteiro}
                onPointerUp={aoSoltar}
                onPointerCancel={() => setArraste(null)}
                onClick={(e) => aoClicarColuna(e, dia)}
                className={cn(
                  "relative cursor-cell touch-pan-y border-l border-outline-variant select-none",
                  fimDeSemana && "bg-surface-container",
                )}
                style={{
                  backgroundImage: "linear-gradient(to bottom, var(--md-outline-variant) 1px, transparent 1px)",
                  backgroundSize: `100% calc(100% / ${horas.length})`,
                }}
              >
                <m.div
                  key={troca?.chave ?? "fixo"}
                  className="pointer-events-none absolute inset-0"
                  initial={troca?.direcao ? { opacity: 0, x: troca.direcao * 24 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: EASE.desacelera }}
                >
                {lista.map((item) => {
                  const ev = item.evento;
                  const emArraste =
                    arraste && arraste.tipo !== "selecao" && ev.tipo === "bloco" && arraste.bloco.chave === ev.chave;
                  return (
                    <CartaoEvento
                      key={ev.tipo === "bloco" ? ev.chave : ev.id}
                      evento={ev}
                      habilidade={habilidades.get(ev.skillId)}
                      ini={item.ini}
                      fim={item.fimMin}
                      topo={pct(item.ini)}
                      altura={pct(item.fimMin) - pct(item.ini)}
                      esquerda={(item.coluna / item.colunas) * 100}
                      largura={100 / item.colunas}
                      compacto={compacto}
                      fantasma={Boolean(emArraste && arraste.moveu)}
                      aoClicar={(e) => aoClicarEvento(e, ev)}
                      aoPressionar={(e, borda) =>
                        ev.tipo === "bloco" && aoPressionarBloco(e, ev, dia, item.ini, item.fimMin, borda)
                      }
                    />
                  );
                })}
                </m.div>

                {/* Prévia: seleção de intervalo ou bloco sendo movido/redimensionado */}
                {arraste && arraste.dia === dia && (arraste.tipo === "selecao" || arraste.moveu) && (
                  <Previa
                    ini={arraste.tipo === "selecao" ? Math.min(arraste.a, arraste.b) : arraste.ini}
                    fim={
                      arraste.tipo === "selecao"
                        ? Math.max(arraste.a, arraste.b, Math.min(arraste.a, arraste.b) + PASSO)
                        : arraste.tipo === "mover"
                          ? arraste.ini + arraste.dur
                          : arraste.fim
                    }
                    pct={pct}
                    cor={arraste.tipo === "selecao" ? null : habilidades.get(arraste.bloco.skillId)?.cor ?? null}
                  />
                )}

                {/* Agora: linha com ponto na ponta */}
                {agoraSP && agoraSP.dia === dia && agoraSP.minuto >= iniFaixa && agoraSP.minuto <= fimFaixa && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center"
                    style={{ top: `${pct(agoraSP.minuto)}%` }}
                    aria-label={`Agora, ${formatarMinuto(agoraSP.minuto)}`}
                  >
                    <span className="-ml-1.5 size-3 shrink-0 rounded-full bg-error" />
                    <span className="h-0.5 flex-1 bg-error" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function colunasGrade(n: number, compacto: boolean) {
  return `${compacto ? "2rem" : "3.5rem"} repeat(${n}, minmax(0, 1fr))`;
}

function Previa({ ini, fim, pct, cor }: { ini: number; fim: number; pct: (m: number) => number; cor: string | null }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0.5 z-10 flex flex-col rounded-md border-2 border-dashed px-1.5 py-1 type-label-medium text-on-surface"
      style={{
        top: `${pct(ini)}%`,
        height: `${pct(fim) - pct(ini)}%`,
        borderColor: cor ? corArea(cor) : "var(--md-primary)",
        backgroundColor: cor ? corAreaSuave(cor) : "color-mix(in oklab, var(--md-primary) 14%, transparent)",
      }}
    >
      <span className="numero">
        {formatarMinuto(ini)}–{formatarMinuto(fim)}
      </span>
    </div>
  );
}

function CartaoEvento({
  evento,
  habilidade,
  ini,
  fim,
  topo,
  altura,
  esquerda,
  largura,
  compacto,
  fantasma,
  aoClicar,
  aoPressionar,
}: {
  evento: Evento;
  habilidade: HabilidadeCal | undefined;
  ini: number;
  fim: number;
  topo: number;
  altura: number;
  esquerda: number;
  largura: number;
  compacto: boolean;
  fantasma: boolean;
  aoClicar: (e: React.MouseEvent) => void;
  aoPressionar: (e: React.PointerEvent, borda: boolean) => void;
}) {
  const bloco = evento.tipo === "bloco";
  const cor = habilidade?.cor ?? null;
  const curto = fim - ini < 60;
  const nome = habilidade?.nome ?? "Habilidade";
  const horario = `${formatarMinuto(ini)}–${formatarMinuto(fim)}`;
  const rotulo = bloco
    ? `Planejado: ${nome}, ${horario}`
    : `Feito: ${nome}, ${horario}, nota ${evento.nota}`;

  return (
    <button
      type="button"
      onClick={aoClicar}
      // Mover/soltar sobem até a coluna, que conduz o arraste.
      onPointerDown={(e) => aoPressionar(e, false)}
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        "group/evento pointer-events-auto absolute z-[1] flex min-h-5 flex-col overflow-hidden rounded-md text-left text-on-surface outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
        bloco ? "border-[1.5px] border-dashed md:cursor-grab md:active:cursor-grabbing" : "border-l-[3px]",
        compacto ? "px-1 py-0.5" : "px-2 py-1",
        fantasma && "opacity-40",
      )}
      style={{
        top: `calc(${topo}% + 1px)`,
        height: `calc(${altura}% - 2px)`,
        left: `calc(${esquerda}% + 2px)`,
        width: `calc(${largura}% - 4px)`,
        backgroundColor: corAreaSuave(cor),
        borderColor: corArea(cor),
      }}
    >
      <span className={cn("flex min-w-0 items-center gap-1 type-label-medium font-medium", curto && "leading-tight")} aria-hidden>
        {bloco && evento.serie && !compacto && <RepeatIcon className="size-3 shrink-0" />}
        {compacto ? (
          <span className="w-full text-center">{sigla(nome)}</span>
        ) : (
          <span className="truncate">
            {nome}
            {curto && <span className="numero ml-1.5 font-normal">{formatarMinuto(ini)}</span>}
          </span>
        )}
      </span>
      {!compacto && !curto && (
        <span className="numero truncate type-label-medium text-on-surface" aria-hidden>
          {horario}
          {!bloco && ` · nota ${evento.nota}`}
        </span>
      )}
      {bloco && (
        <span
          aria-hidden
          onPointerDown={(e) => aoPressionar(e, true)}
          className="absolute inset-x-0 bottom-0 hidden h-2 cursor-ns-resize md:block"
        />
      )}
    </button>
  );
}

/** Sigla da habilidade para as colunas estreitas: "Vendas B2B" → "VB", "Inglês" → "In". */
function sigla(nome: string) {
  const palavras = nome.trim().split(/s+/);
  return palavras.length > 1 ? (palavras[0][0] + palavras[1][0]).toUpperCase() : nome.slice(0, 2);
}
