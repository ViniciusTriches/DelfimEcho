"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Maximize2Icon, PauseIcon, PlayIcon, SquareIcon, XIcon, ZapIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Cronometro, type EstadoTimer, useAgora } from "@/components/cronometro";
import { Button } from "@/components/ui/button";
import { formatarCronometro } from "@/lib/datas";
import { segundosDoTimer } from "@/lib/pratica";
import { cn } from "@/lib/utils";
import { descartarTimer, encerrarTimer, pausarTimer, registrarDistracao, retomarTimer } from "./actions";

type Props = {
  timer: EstadoTimer;
  distracoes: number;
  habilidade: string;
  area: string;
  cor: string;
  foco: string | null;
};

const SINCRONIZAR_A_CADA_MS = 30_000;

/** Recarrega os dados do servidor ao voltar para a aba e periodicamente (timer pode mudar em outro aparelho). */
function useSincronizar() {
  const router = useRouter();
  useEffect(() => {
    const atualizar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", atualizar);
    window.addEventListener("focus", atualizar);
    const id = setInterval(atualizar, SINCRONIZAR_A_CADA_MS);
    return () => {
      document.removeEventListener("visibilitychange", atualizar);
      window.removeEventListener("focus", atualizar);
      clearInterval(id);
    };
  }, [router]);
}

/** Tela cheia + tela sempre acesa enquanto o modo foco estiver aberto (quando o navegador permite). */
function useModoFoco(ativo: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    if (!ativo) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
    navigator.wakeLock
      ?.request("screen")
      .then((w) => (wakeLock.current = w))
      .catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, [ativo]);
}

export function TimerPainel({ timer, distracoes, habilidade, area, cor, foco }: Props) {
  useSincronizar();
  const [modoFoco, setModoFoco] = useState(false);
  useModoFoco(modoFoco);
  const [pendente, startTransition] = useTransition();

  const [pausadoOtimista, setPausadoOtimista] = useOptimistic(Boolean(timer.pausado_em));
  const [distracoesOtimistas, somarDistracao] = useOptimistic(distracoes, (n: number, delta: number) => n + delta);
  const pausado = pausadoOtimista;

  // Título da aba com o cronômetro, para acompanhar de outra aba.
  const agora = useAgora(!timer.pausado_em);
  useEffect(() => {
    const anterior = document.title;
    document.title = `${formatarCronometro(segundosDoTimer(timer, agora))} · ${habilidade}`;
    return () => {
      document.title = anterior;
    };
  }, [agora, timer, habilidade]);

  function executar(acao: () => Promise<{ erro?: string } | void>, otimista?: () => void) {
    startTransition(async () => {
      otimista?.();
      const r = await acao();
      if (r?.erro) toast.error(r.erro);
    });
  }

  const alternarPausa = () =>
    executar(pausado ? retomarTimer : pausarTimer, () => setPausadoOtimista(!pausado));
  const distrair = () => executar(registrarDistracao, () => somarDistracao(1));
  const encerrar = () => {
    setModoFoco(false);
    executar(encerrarTimer);
  };

  const botoes = (grande: boolean) => (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", grande && "gap-4")}>
      <Button
        variant="outline"
        size="lg"
        className={cn("h-12 min-w-36", grande && "h-14 min-w-40 text-base")}
        onClick={distrair}
      >
        <ZapIcon />
        Me distraí
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{distracoesOtimistas}</span>
      </Button>
      <Button
        variant="outline"
        size="lg"
        className={cn("h-12 min-w-32", grande && "h-14 min-w-36 text-base")}
        onClick={alternarPausa}
        disabled={pendente}
      >
        {pausado ? <PlayIcon /> : <PauseIcon />}
        {pausado ? "Retomar" : "Pausar"}
      </Button>
      <Button
        size="lg"
        className={cn("h-12 min-w-32", grande && "h-14 min-w-36 text-base")}
        onClick={encerrar}
        disabled={pendente}
      >
        <SquareIcon />
        Encerrar
      </Button>
    </div>
  );

  const cabecalho = (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full" style={{ backgroundColor: cor }} aria-hidden />
        {area}
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{habilidade}</h1>
      {foco && <p className="max-w-lg text-muted-foreground">{foco}</p>}
    </div>
  );

  const relogio = (classe: string) => (
    <div className="flex flex-col items-center gap-1">
      <Cronometro timer={timer} className={cn("font-mono font-semibold tabular-nums", classe, pausado && "opacity-50")} />
      {pausado && <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">pausado</span>}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {cabecalho}
      {relogio("text-6xl sm:text-7xl")}
      {botoes(false)}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" onClick={() => setModoFoco(true)}>
          <Maximize2Icon />
          Modo foco
        </Button>
        <ConfirmButton
          acao={descartarTimer}
          confirmar="Descartar o timer sem salvar a sessão?"
          variant="ghost"
          className="text-muted-foreground"
        >
          Descartar
        </ConfirmButton>
      </div>

      {modoFoco &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-background p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              aria-label="Sair do modo foco"
              onClick={() => setModoFoco(false)}
            >
              <XIcon />
            </Button>
            {cabecalho}
            {relogio("text-7xl sm:text-9xl")}
            {botoes(true)}
          </div>,
          document.body,
        )}
    </div>
  );
}
