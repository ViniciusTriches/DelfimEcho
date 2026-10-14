"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ErroFormulario } from "@/components/erro-formulario";
import { Horas } from "@/components/horas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enviarSemResetar } from "@/lib/form";
import { formatarHoras } from "@/lib/formato";
import { corArea } from "@/lib/cores-area";
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
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="semana" value={semana} />
      <ul className="flex flex-col divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low">
        {linhas.map((l) => (
          <li key={l.areaId} className="flex min-h-18 items-center gap-4 px-4 py-3">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: corArea(l.cor) }} aria-hidden />
            <label htmlFor={`horas_${l.areaId}`} className="min-w-0 flex-1">
              <span className="block type-title-small text-on-surface">{l.nome}</span>
              <span className="block type-body-small text-on-surface-variant">
                {rotuloReferencia}: <span className="numero">{formatarHoras(l.realizadoAnterior)}</span> efetivas
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
                className="numero pr-8 text-right"
              />
              <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 type-body-large text-on-surface-variant">
                h
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="flex items-baseline justify-between gap-4 rounded-lg bg-secondary-container px-4 py-3 type-body-medium text-on-secondary-container" aria-live="polite">
        Total planejado na semana
        <span className="type-title-large">
          <Horas valor={total} /> <span className="type-body-medium">efetivas</span>
        </span>
      </p>

      {estado?.erro && (
        <ErroFormulario>{estado.erro}</ErroFormulario>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar plano"}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "text" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
