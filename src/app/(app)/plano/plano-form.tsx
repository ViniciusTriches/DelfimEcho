"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enviarSemResetar } from "@/lib/form";
import { formatarHoras } from "@/lib/formato";
import { salvarPlano } from "./actions";

export type LinhaPlano = {
  areaId: string;
  nome: string;
  cor: string;
  horas: number | null; // valor inicial (desta semana ou copiado)
  realizadoAnterior: number; // horas efetivas na semana de referência
};

export function PlanoForm({
  linhas,
  semana,
  rotuloReferencia,
}: {
  linhas: LinhaPlano[];
  semana: string;
  rotuloReferencia: string;
}) {
  const [estado, acao, pendente] = useActionState(salvarPlano, null);
  const [valores, setValores] = useState(() =>
    Object.fromEntries(linhas.map((l) => [l.areaId, l.horas === null ? "" : String(l.horas)])),
  );
  const total = Object.values(valores).reduce((t, v) => t + (Number(v.replace(",", ".")) || 0), 0);

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="semana" value={semana} />
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {linhas.map((l) => (
          <li key={l.areaId} className="flex items-center gap-3 px-4 py-3">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.cor }} aria-hidden />
            <label htmlFor={`horas_${l.areaId}`} className="min-w-0 flex-1">
              <span className="block font-medium">{l.nome}</span>
              <span className="block text-xs text-muted-foreground">
                {rotuloReferencia}: {formatarHoras(l.realizadoAnterior)} efetivas
              </span>
            </label>
            <div className="relative w-28 shrink-0">
              <Input
                id={`horas_${l.areaId}`}
                name={`horas_${l.areaId}`}
                type="number"
                inputMode="decimal"
                min={0}
                max={168}
                step={0.5}
                value={valores[l.areaId]}
                onChange={(e) => setValores((v) => ({ ...v, [l.areaId]: e.target.value }))}
                placeholder="—"
                className="h-11 pr-7 text-right sm:h-9"
              />
              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                h
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-sm">
        Total planejado: <strong className="tabular-nums">{formatarHoras(total)}</strong>
        <span className="text-muted-foreground"> efetivas na semana</span>
      </p>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente} className="min-h-11 sm:min-h-8">
          {pendente ? "Salvando…" : "Salvar plano"}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "min-h-11 sm:min-h-8" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
