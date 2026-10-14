"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarIcon, CheckIcon, ClockIcon, PencilIcon, RepeatIcon, StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { BotaoIniciarTimer } from "@/components/botao-iniciar-timer";
import { Horas } from "@/components/horas";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { descreverRepeticao, formatarMinuto, localSP } from "@/lib/calendario";
import { corArea } from "@/lib/cores-area";
import { formatarDia, formatarDiaSemana, formatarDuracao, paraInputLocal } from "@/lib/datas";
import { excluirBloco, type Escopo } from "./actions";
import { useAgoraMinuto } from "./grade";
import type { BlocoCal, HabilidadeCal, SessaoCal } from "./dados";

type Props = {
  evento: BlocoCal | SessaoCal | null;
  habilidades: Map<string, HabilidadeCal>;
  aoFechar: () => void;
  aoEditar: (bloco: BlocoCal) => void;
};

/** Detalhes de um bloco planejado ou de uma sessão feita, com as ações de cada um. */
export function Detalhes({ evento, habilidades, aoFechar, aoEditar }: Props) {
  return (
    <Dialog open={evento !== null} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        {evento?.tipo === "bloco" && (
          <DetalhesBloco bloco={evento} habilidade={habilidades.get(evento.skillId)} aoFechar={aoFechar} aoEditar={aoEditar} />
        )}
        {evento?.tipo === "sessao" && <DetalhesSessao sessao={evento} habilidade={habilidades.get(evento.skillId)} />}
      </DialogContent>
    </Dialog>
  );
}

function Cabecalho({ habilidade, rotulo }: { habilidade: HabilidadeCal | undefined; rotulo: React.ReactNode }) {
  return (
    <DialogHeader>
      {rotulo}
      <DialogTitle>{habilidade?.nome ?? "Habilidade"}</DialogTitle>
      {habilidade && (
        <DialogDescription className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: corArea(habilidade.cor) }} aria-hidden />
          {habilidade.area}
        </DialogDescription>
      )}
    </DialogHeader>
  );
}

function Linha({ icone: Icone, children }: { icone: typeof ClockIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 type-body-medium text-on-surface">
      <Icone className="mt-0.5 size-4 shrink-0 text-on-surface-variant" aria-hidden />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function quando(inicio: string, fim: string) {
  const a = localSP(inicio);
  const b = localSP(fim);
  const dia = `${formatarDiaSemana(a.dia)}, ${formatarDia(a.dia)}`;
  return (
    <>
      <span className="first-letter:uppercase">{dia}</span> ·{" "}
      <span className="numero">
        {formatarMinuto(a.minuto)}–{formatarMinuto(b.dia > a.dia ? 1440 : b.minuto)}
      </span>
    </>
  );
}

function DetalhesBloco({
  bloco,
  habilidade,
  aoFechar,
  aoEditar,
}: {
  bloco: BlocoCal;
  habilidade: HabilidadeCal | undefined;
  aoFechar: () => void;
  aoEditar: (bloco: BlocoCal) => void;
}) {
  const [excluindo, setExcluindo] = useState(false);
  const [pendente, start] = useTransition();
  const agora = useAgoraMinuto()?.getTime() ?? 0;
  const comecou = new Date(bloco.inicio).getTime() <= agora;
  // Registrar como feito: horário do bloco (se ainda está rolando, até agora).
  const fimRegistro = new Date(Math.min(new Date(bloco.fim).getTime(), agora));
  const registrar = new URLSearchParams({
    habilidade: bloco.skillId,
    inicio: paraInputLocal(new Date(bloco.inicio)),
    fim: paraInputLocal(fimRegistro),
    ...(bloco.observacao ? { foco: bloco.observacao } : {}),
  });
  const repeticao = descreverRepeticao(bloco.repeteDias, bloco.repeteAte);

  function excluir(escopo: Escopo) {
    aoFechar();
    start(async () => {
      const r = await excluirBloco(bloco.blocoId, bloco.data, escopo);
      if (r?.erro) toast.error(r.erro);
      else toast.success(escopo === "seguintes" && bloco.serie ? "Blocos excluídos" : "Bloco excluído");
    });
  }

  if (excluindo) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{bloco.serie ? "Excluir bloco que se repete" : "Excluir este bloco?"}</DialogTitle>
          <DialogDescription>
            {bloco.serie
              ? "Excluir só esta ocorrência ou esta e as próximas da série? As anteriores ficam."
              : "O bloco sai do calendário. Sessões já registradas não mudam."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="text" onClick={() => setExcluindo(false)}>
            Cancelar
          </Button>
          {bloco.serie ? (
            <>
              <Button variant="text" className="text-error" onClick={() => excluir("seguintes")} disabled={pendente}>
                Este e os seguintes
              </Button>
              <Button variant="text" className="text-error" onClick={() => excluir("este")} disabled={pendente} autoFocus>
                Só este
              </Button>
            </>
          ) : (
            <Button variant="text" className="text-error" onClick={() => excluir("este")} disabled={pendente} autoFocus>
              Excluir
            </Button>
          )}
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <Cabecalho
        habilidade={habilidade}
        rotulo={
          <span className="w-fit rounded-sm border border-dashed border-outline px-2 py-0.5 type-label-medium text-on-surface-variant">
            Planejado
          </span>
        }
      />
      <div className="flex flex-col gap-3">
        <Linha icone={CalendarIcon}>{quando(bloco.inicio, bloco.fim)}</Linha>
        {repeticao && <Linha icone={RepeatIcon}>{repeticao}</Linha>}
        {bloco.observacao && <Linha icone={PencilIcon}>{bloco.observacao}</Linha>}
      </div>
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
        {habilidade?.ativa && <BotaoIniciarTimer skillId={bloco.skillId} foco={bloco.observacao ?? ""} />}
        {comecou && habilidade?.ativa && (
          <Link href={`/registrar?${registrar}`} className={buttonVariants({ variant: "secondary" })}>
            <CheckIcon />
            Registrar como feito
          </Link>
        )}
      </div>
      <DialogFooter className="mt-0 border-t border-outline-variant pt-3">
        <Button variant="text" className="text-error sm:mr-auto" onClick={() => setExcluindo(true)}>
          <Trash2Icon />
          Excluir
        </Button>
        <Button variant="text" onClick={() => aoEditar(bloco)}>
          <PencilIcon />
          Editar
        </Button>
      </DialogFooter>
    </>
  );
}

function DetalhesSessao({ sessao, habilidade }: { sessao: SessaoCal; habilidade: HabilidadeCal | undefined }) {
  return (
    <>
      <Cabecalho
        habilidade={habilidade}
        rotulo={
          <span className="w-fit rounded-sm bg-secondary-container px-2 py-0.5 type-label-medium text-on-secondary-container">
            Feito
          </span>
        }
      />
      <div className="flex flex-col gap-3">
        <Linha icone={CalendarIcon}>{quando(sessao.inicio, sessao.fim)}</Linha>
        <Linha icone={ClockIcon}>
          {formatarDuracao(sessao.minutos)} · <Horas valor={sessao.horasEfetivas} /> efetivas
        </Linha>
        <Linha icone={StarIcon}>
          Nota <span className="numero">{sessao.nota}</span> de 5
        </Linha>
        {sessao.foco && <Linha icone={PencilIcon}>{sessao.foco}</Linha>}
      </div>
      <DialogFooter className="mt-0">
        <Link href={`/habilidades/${sessao.skillId}`} className={buttonVariants({ variant: "text" })}>
          Ver {habilidade?.nome ?? "habilidade"}
        </Link>
      </DialogFooter>
    </>
  );
}
