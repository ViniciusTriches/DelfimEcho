"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarSemResetar } from "@/lib/form";
import type { FatorQualidade } from "@/lib/pratica";
import { salvarFatores } from "./actions";

export function FatoresForm({ fatores, fatorPassivo }: { fatores: FatorQualidade[]; fatorPassivo: number }) {
  const [estado, acao, pendente] = useActionState(salvarFatores, null);

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Fator por nota de qualidade</legend>
        {fatores.map((f) => (
          <div key={f.nota} className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {f.nota}
            </span>
            <Input
              aria-label={`Fator da nota ${f.nota}`}
              name={`fator_${f.nota}`}
              type="number"
              inputMode="decimal"
              min={0}
              max={1}
              step={0.05}
              defaultValue={f.fator}
              className="w-20 shrink-0"
              required
            />
            <Input
              aria-label={`Descrição da nota ${f.nota}`}
              name={`descricao_${f.nota}`}
              defaultValue={f.descricao ?? ""}
              maxLength={80}
              className="min-w-0 flex-1"
            />
          </div>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fator_pratica_passiva">Fator da prática passiva</Label>
        <Input
          id="fator_pratica_passiva"
          name="fator_pratica_passiva"
          type="number"
          inputMode="decimal"
          min={0}
          max={1}
          step={0.05}
          defaultValue={fatorPassivo}
          className="w-24"
          required
        />
        <p className="text-xs text-muted-foreground">
          Multiplica as horas efetivas de sessões marcadas como passivas (ouvir, assistir). Só aparece
          nas habilidades com &quot;Permite prática passiva&quot; ligado.
        </p>
      </div>

      {estado && (
        <p role="status" className={estado.ok ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-destructive"}>
          {estado.mensagem}
        </p>
      )}

      <Button type="submit" disabled={pendente} className="w-fit">
        {pendente ? "Salvando…" : "Salvar fatores"}
      </Button>
    </form>
  );
}
