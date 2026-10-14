"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { encaixar, localSP, type Visao, VISOES } from "@/lib/calendario";
import { formatarMesAno, inicioSemana, mesDe, somarDias, somarMeses } from "@/lib/datas";
import { cn } from "@/lib/utils";
import { type Escopo, moverBloco } from "./actions";
import { BlocoForm, type Rascunho } from "./bloco-form";
import type { BlocoCal, DiaInteiro, HabilidadeCal, ResumoArea, SessaoCal } from "./dados";
import { Detalhes } from "./detalhes";
import { type Evento, Grade } from "./grade";
import { Mes } from "./mes";
import { ResumoSemana } from "./resumo-semana";

export type DiaMes = {
  dia: string;
  horas: number;
  nivel: 0 | 1 | 2 | 3 | 4;
  blocos: number;
  metas: number;
  marcos: number;
};

type Props = {
  visao: Visao;
  /** Palpite do servidor (celular?) para o primeiro desenho, antes de medir a tela. */
  celular: boolean;
  data: string;
  hoje: string;
  blocos: BlocoCal[];
  sessoes: SessaoCal[];
  habilidades: HabilidadeCal[];
  diaInteiro: DiaInteiro[];
  faixa: { inicio: number; fim: number };
  resumo: ResumoArea[] | null;
  mes: DiaMes[] | null;
};

const MES_CURTO = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "short" });
const href = (v: Visao, d: string) => `/calendario?visao=${v}&data=${d}`;

// Tela estreita (celular): a semana usa colunas compactas, sem rolagem horizontal.
const consultaEstreita = "(max-width: 639px)";
const inscreverLargura = (aviso: () => void) => {
  const mq = window.matchMedia(consultaEstreita);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
};

type Ajustes = { base: BlocoCal[]; mapa: Record<string, { inicio: string; fim: string }> };

export function Calendario(props: Props) {
  const { visao, hoje } = props;
  const router = useRouter();
  const [navegando, startNav] = useTransition();
  const [, startMover] = useTransition();
  const estreita = useSyncExternalStore(
    inscreverLargura,
    () => window.matchMedia(consultaEstreita).matches,
    () => props.celular,
  );

  // Visão Dia: trocar de dia dentro da semana carregada não volta ao servidor.
  const semana = inicioSemana(props.data);
  const [dia, setDia] = useState(props.data);
  const [direcao, setDirecao] = useState(0);
  const atual = visao === "dia" ? dia : props.data;

  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [editando, setEditando] = useState<BlocoCal | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [detalhe, setDetalhe] = useState<Evento | null>(null);
  const [movendo, setMovendo] = useState<{ bloco: BlocoCal; inicio: Date; fim: Date } | null>(null);

  // Arrastes ficam no lugar novo na hora; somem quando os dados do servidor chegam.
  const [ajustes, setAjustes] = useState<Ajustes>({ base: props.blocos, mapa: {} });
  const blocos =
    ajustes.base === props.blocos
      ? props.blocos.map((b) => (ajustes.mapa[b.chave] ? { ...b, ...ajustes.mapa[b.chave] } : b))
      : props.blocos;
  const eventos: Evento[] = useMemo(() => [...blocos, ...props.sessoes], [blocos, props.sessoes]);
  const habilidades = useMemo(() => new Map(props.habilidades.map((h) => [h.id, h])), [props.habilidades]);

  function ir(v: Visao, d: string) {
    if (v === "dia" && visao === "dia" && d >= semana && d <= somarDias(semana, 6)) {
      setDirecao(d > dia ? 1 : d < dia ? -1 : 0);
      setDia(d);
      window.history.replaceState(null, "", href(v, d));
      return;
    }
    startNav(() => router.push(href(v, d)));
  }

  function passo(n: 1 | -1) {
    if (visao === "dia") ir("dia", somarDias(atual, n));
    else if (visao === "semana") ir("semana", somarDias(atual, 7 * n));
    else ir("mes", `${somarMeses(mesDe(atual), n)}-01`);
  }

  function criar(d: string, ini: number, fim: number) {
    setEditando(null);
    setRascunho({ data: d, ini, fim });
    setFormAberto(true);
  }

  function novoBloco() {
    const alvo = visao === "semana" ? (hoje >= semana && hoje <= somarDias(semana, 6) ? hoje : semana) : atual;
    const agora = localSP(new Date());
    const ini = alvo === agora.dia ? Math.min(23 * 60, encaixar(agora.minuto + 30, 60)) : 9 * 60;
    criar(alvo, ini, Math.min(1440, ini + 60));
  }

  function moverAgora(bloco: BlocoCal, inicio: Date, fim: Date, escopo: Escopo) {
    setAjustes((a) => ({
      base: props.blocos,
      mapa: { ...(a.base === props.blocos ? a.mapa : {}), [bloco.chave]: { inicio: inicio.toISOString(), fim: fim.toISOString() } },
    }));
    startMover(async () => {
      const r = await moverBloco(bloco.blocoId, bloco.data, inicio.toISOString(), fim.toISOString(), escopo);
      if (r?.erro) {
        toast.error(r.erro);
        setAjustes({ base: props.blocos, mapa: {} });
      }
    });
  }

  function aoMover(bloco: BlocoCal, inicio: Date, fim: Date) {
    const mesmoDia = localSP(inicio).dia === bloco.data;
    if (bloco.serie && mesmoDia) setMovendo({ bloco, inicio, fim });
    else {
      moverAgora(bloco, inicio, fim, "este");
      if (bloco.serie) toast("Só esta ocorrência mudou de dia; a série continua igual.");
    }
  }

  const titulo =
    visao === "semana" && mesDe(semana) !== mesDe(somarDias(semana, 6))
      ? `${MES_CURTO.format(new Date(`${semana}T00:00:00Z`)).replace(".", "")} – ${formatarMesAno(somarDias(semana, 6))}`
      : formatarMesAno(atual);
  const diasGrade = visao === "dia" ? [dia] : Array.from({ length: 7 }, (_, i) => somarDias(semana, i));

  // Deslizar para os lados troca o dia (só na visão Dia).
  const toque = useRef<{ x: number; y: number } | null>(null);
  const deslize =
    visao === "dia"
      ? {
          onTouchStart: (e: React.TouchEvent) => {
            toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          },
          onTouchEnd: (e: React.TouchEvent) => {
            const t = toque.current;
            toque.current = null;
            if (!t) return;
            const dx = e.changedTouches[0].clientX - t.x;
            const dy = e.changedTouches[0].clientY - t.y;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) passo(dx < 0 ? 1 : -1);
          },
        }
      : {};

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <h1 className="min-w-0 truncate type-headline-small text-on-surface first-letter:uppercase md:type-headline-medium" aria-live="polite">
            {titulo}
          </h1>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => passo(-1)} aria-label={`${VISOES.find((v) => v.valor === visao)?.nome} anterior`}>
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="sm" onClick={() => ir(visao, hoje)} disabled={atual === hoje && visao === "dia"}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={() => passo(1)} aria-label={`Próximo(a) ${VISOES.find((v) => v.valor === visao)?.nome.toLowerCase()}`}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="flex flex-1 sm:w-64 sm:flex-none" role="group" aria-label="Visão">
            {VISOES.map((v) => (
              <button key={v.valor} type="button" className="segmento" aria-pressed={visao === v.valor} onClick={() => ir(v.valor, atual)}>
                {v.nome}
              </button>
            ))}
          </div>
          <Button onClick={novoBloco} className="shrink-0">
            <PlusIcon />
            Novo bloco
          </Button>
        </div>
      </div>

      <div className={cn("transition-opacity duration-150", navegando && "opacity-60")} aria-busy={navegando}>
        {visao === "mes" && props.mes ? (
          <Mes dias={props.mes} mes={mesDe(atual)} hoje={hoje} hrefDia={(d) => href("dia", d)} />
        ) : (
          <div {...deslize}>
            <Grade
              dias={diasGrade}
              hoje={hoje}
              eventos={eventos}
              diaInteiro={props.diaInteiro}
              habilidades={habilidades}
              faixa={props.faixa}
              compacto={visao === "semana" && estreita}
              troca={visao === "dia" ? { chave: dia, direcao } : undefined}
              aoCriar={criar}
              aoAbrir={setDetalhe}
              aoMover={aoMover}
            />
          </div>
        )}
      </div>

      {visao !== "mes" && <Legenda />}

      {visao === "semana" && props.resumo && <ResumoSemana linhas={props.resumo} semana={semana} />}

      <BlocoForm
        aberto={formAberto}
        aoFechar={() => setFormAberto(false)}
        rascunho={rascunho}
        bloco={editando}
        habilidades={props.habilidades}
      />
      <Detalhes
        evento={detalhe}
        habilidades={habilidades}
        aoFechar={() => setDetalhe(null)}
        aoEditar={(b) => {
          setDetalhe(null);
          setRascunho(null);
          setEditando(b);
          setFormAberto(true);
        }}
      />

      <Dialog open={movendo !== null} onOpenChange={(a) => !a && setMovendo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mover bloco que se repete</DialogTitle>
            <DialogDescription>Mudar o horário só desta ocorrência ou desta e das próximas?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="text" onClick={() => setMovendo(null)}>
              Cancelar
            </Button>
            <Button
              variant="text"
              onClick={() => {
                if (movendo) moverAgora(movendo.bloco, movendo.inicio, movendo.fim, "seguintes");
                setMovendo(null);
              }}
            >
              Este e os seguintes
            </Button>
            <Button
              variant="text"
              autoFocus
              onClick={() => {
                if (movendo) moverAgora(movendo.bloco, movendo.inicio, movendo.fim, "este");
                setMovendo(null);
              }}
            >
              Só este
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Planejado (borda tracejada) × feito (borda lateral cheia): a diferença não depende só da cor. */
function Legenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 type-label-medium text-on-surface-variant">
      <span className="flex items-center gap-2">
        <span className="h-3.5 w-5 rounded-[4px] border-[1.5px] border-dashed border-outline bg-surface-container-high" aria-hidden />
        Planejado
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3.5 w-5 rounded-[4px] border-l-[3px] border-outline bg-surface-container-high" aria-hidden />
        Feito
      </span>
      <span className="hidden items-center gap-2 md:flex">Arraste numa coluna para criar; arraste um bloco para mover.</span>
    </div>
  );
}
