"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarSemResetar } from "@/lib/form";
import { registrarValor } from "./actions";

/** Registro de um valor. Compacto: só o número (data = hoje). Completo: data e observação. */
export function ValorForm({
  metricId,
  nome,
  unidade,
  hoje,
  completo = false,
}: {
  metricId: string;
  nome: string;
  unidade: string | null;
  hoje: string;
  completo?: boolean;
}) {
  const [estado, acao, pendente] = useActionState(registrarValor, null);
  // Depois de registrar, remonta os campos vazios.
  const [chave, setChave] = useState(0);
  const [visto, setVisto] = useState<typeof estado>(null);
  if (estado?.ok && estado !== visto) {
    setVisto(estado);
    setChave((c) => c + 1);
  }

  const idValor = `valor-${metricId}${completo ? "-completo" : ""}`;

  return (
    <form key={chave} onSubmit={enviarSemResetar(acao)} className={completo ? "flex flex-col gap-4" : "flex flex-col gap-2"}>
      <input type="hidden" name="metric_id" value={metricId} />
      <div className={completo ? "grid gap-3 sm:grid-cols-[1fr_11rem]" : "flex gap-2"}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {completo && <Label htmlFor={idValor}>Valor{unidade ? ` (${unidade})` : ""}</Label>}
          <Input
            id={idValor}
            name="valor"
            type="number"
            inputMode="decimal"
            step="any"
            required
            className="numero"
            aria-label={completo ? undefined : `Novo valor de ${nome}${unidade ? ` em ${unidade}` : ""}`}
            placeholder={completo ? undefined : unidade ? `Novo valor (${unidade})` : "Novo valor"}
          />
        </div>
        {completo && (
          <div className="flex flex-col gap-2">
            <Label htmlFor={`data-${metricId}`}>Data</Label>
            <Input id={`data-${metricId}`} name="data" type="date" defaultValue={hoje} max={hoje} required />
          </div>
        )}
        {!completo && (
          <Button type="submit" variant="secondary" disabled={pendente} className="shrink-0" aria-label={`Registrar ${nome}`}>
            <PlusIcon />
            {pendente ? "…" : "Registrar"}
          </Button>
        )}
      </div>
      {completo && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`obs-${metricId}`}>
              Observação <span className="text-on-surface-variant">(opcional)</span>
            </Label>
            <Input id={`obs-${metricId}`} name="observacao" maxLength={200} />
          </div>
          <Button type="submit" disabled={pendente} className="w-fit">
            {pendente ? "Registrando…" : "Registrar valor"}
          </Button>
        </>
      )}
      {estado && (
        <p role="status" className={estado.ok ? "type-body-small text-on-surface-variant" : "type-body-small text-error"}>
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
