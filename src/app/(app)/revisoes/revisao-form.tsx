"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CalendarRangeIcon, CheckCircle2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarSemResetar } from "@/lib/form";
import type { Linha } from "@/lib/tipos";
import { salvarRevisao } from "./actions";

const NOTAS = [
  { valor: 1, nome: "Ruim" },
  { valor: 2, nome: "Fraca" },
  { valor: 3, nome: "Ok" },
  { valor: 4, nome: "Boa" },
  { valor: 5, nome: "Ótima" },
];

export function RevisaoForm({
  tipo,
  periodoInicio,
  revisao,
  planejarHref,
}: {
  tipo: "semanal" | "mensal";
  periodoInicio: string;
  revisao: Linha<"reviews"> | null;
  /** Só na semanal: link para planejar a próxima semana a partir desta. */
  planejarHref?: string;
}) {
  const [estado, acao, pendente] = useActionState(salvarRevisao, null);
  const proximo = tipo === "semanal" ? "da próxima semana" : "do próximo mês";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-5">
        <input type="hidden" name="tipo" value={tipo} />
        <input type="hidden" name="periodo_inicio" value={periodoInicio} />

        <Campo id="o_que_funcionou" rotulo="O que funcionou?" valor={revisao?.o_que_funcionou} dica="Práticas, horários, decisões que deram certo" />
        <Campo id="onde_travei" rotulo="Onde travei?" valor={revisao?.onde_travei} dica="O que atrapalhou, o que ficou para trás e por quê" />
        <Campo
          id="prioridades_proximo_periodo"
          rotulo={`Prioridades ${proximo}`}
          valor={revisao?.prioridades_proximo_periodo}
          dica="Uma a três coisas que mais importam"
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">
            Nota geral {tipo === "semanal" ? "da semana" : "do mês"}
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {NOTAS.map((n) => (
              <label
                key={n.valor}
                className="flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-lg border transition-colors duration-150 has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="nota_geral"
                  value={n.valor}
                  defaultChecked={revisao?.nota_geral === n.valor}
                  className="sr-only"
                />
                <span className="font-semibold">{n.valor}</span>
                <span className="text-xs text-muted-foreground">{n.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {estado && !estado.ok && (
          <p role="alert" className="text-sm text-destructive">
            {estado.mensagem}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pendente} className="h-11 w-full sm:w-fit">
          {pendente ? "Salvando…" : revisao ? "Atualizar revisão" : "Salvar revisão"}
        </Button>
      </form>

      {estado?.ok && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2Icon className="size-5 text-[var(--concluido)]" aria-hidden />
            {estado.mensagem}
          </p>
          {planejarHref ? (
            <>
              <p className="text-sm text-muted-foreground">
                Próximo passo: transformar as prioridades em horas por área.
              </p>
              <Link href={planejarHref} className={buttonVariants({ size: "lg", className: "h-11 w-full sm:w-fit" })}>
                <CalendarRangeIcon />
                Planejar próxima semana
              </Link>
            </>
          ) : (
            <Link href="/revisoes" className="text-sm text-primary underline-offset-4 hover:underline">
              Ver revisões anteriores
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Campo({ id, rotulo, valor, dica }: { id: string; rotulo: string; valor?: string | null; dica: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{rotulo}</Label>
      <Textarea id={id} name={id} defaultValue={valor ?? ""} rows={3} maxLength={2000} placeholder={dica} />
    </div>
  );
}
