"use client";

import { useActionState } from "react";
import { CheckIcon } from "lucide-react";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarSemResetar } from "@/lib/form";
import { salvarAlerta } from "./actions";

export function AlertaForm({ dias }: { dias: number }) {
  const [estado, acao, pendente] = useActionState(salvarAlerta, null);
  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-4">
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
            className="numero w-28"
            required
          />
          <span className="type-body-medium text-on-surface-variant">dias ou mais</span>
        </div>
      </div>
      {estado && (
        estado.ok ? (
          <p role="status" className="flex items-center gap-2 type-body-medium text-on-surface-variant">
            <CheckIcon className="size-4 text-concluido" aria-hidden />
            {estado.mensagem}
          </p>
        ) : (
          <ErroFormulario>{estado.mensagem}</ErroFormulario>
        )
      )}
      <Button type="submit" disabled={pendente} className="w-fit">
        {pendente ? "Salvando…" : "Salvar alerta"}
      </Button>
    </form>
  );
}
