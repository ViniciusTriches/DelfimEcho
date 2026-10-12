"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarSemResetar } from "@/lib/form";
import { salvarAlerta } from "./actions";

export function AlertaForm({ dias }: { dias: number }) {
  const [estado, acao, pendente] = useActionState(salvarAlerta, null);
  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="dias_alerta_abandono">Avisar quando uma habilidade ficar sem sessão por</Label>
        <div className="flex items-center gap-2">
          <Input
            id="dias_alerta_abandono"
            name="dias_alerta_abandono"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            step={1}
            defaultValue={dias}
            className="h-11 w-24 sm:h-8"
            required
          />
          <span className="text-sm text-muted-foreground">dias ou mais</span>
        </div>
      </div>
      {estado && (
        <p role="status" className={estado.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
          {estado.mensagem}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={pendente} className="min-h-11 w-fit sm:min-h-8">
        {pendente ? "Salvando…" : "Salvar alerta"}
      </Button>
    </form>
  );
}
