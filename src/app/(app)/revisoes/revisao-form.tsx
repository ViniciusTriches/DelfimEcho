"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CalendarRangeIcon, CheckCircle2Icon } from "lucide-react";
import { ErroFormulario } from "@/components/erro-formulario";
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
      <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-6">
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
          <legend className="mb-3 type-title-small text-on-surface">
            Nota geral {tipo === "semanal" ? "da semana" : "do mês"}
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {NOTAS.map((n) => (
              <label
                key={n.valor}
                className="opcao flex min-h-16 flex-col items-center justify-center gap-0.5"
              >
                <input
                  type="radio"
                  name="nota_geral"
                  value={n.valor}
                  defaultChecked={revisao?.nota_geral === n.valor}
                  className="sr-only"
                />
                <span className="numero type-title-medium">{n.valor}</span>
                <span className="type-label-medium opacity-80">{n.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {estado && !estado.ok && (
          <ErroFormulario>{estado.mensagem}</ErroFormulario>
        )}

        <Button type="submit" size="lg" disabled={pendente} className="w-full sm:w-fit">
          {pendente ? "Salvando…" : revisao ? "Atualizar revisão" : "Salvar revisão"}
        </Button>
      </form>

      {estado?.ok && (
        <div role="status" className="flex flex-col items-start gap-3 rounded-lg bg-secondary-container p-5 text-on-secondary-container">
          <p className="flex items-center gap-2 type-title-medium">
            <CheckCircle2Icon className="size-5" aria-hidden />
            {estado.mensagem}
          </p>
          {planejarHref ? (
            <>
              <p className="type-body-medium">
                Próximo passo: transformar as prioridades em horas por área.
              </p>
              <Link href={planejarHref} className={buttonVariants({ size: "lg", className: "w-full sm:w-fit" })}>
                <CalendarRangeIcon />
                Planejar próxima semana
              </Link>
            </>
          ) : (
            <Link href="/revisoes" className={buttonVariants({ variant: "text", className: "-ml-3" })}>
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
