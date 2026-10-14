"use client";

import { useActionState } from "react";
import { CheckIcon } from "lucide-react";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { enviarSemResetar } from "@/lib/form";
import { salvarFaixaCalendario } from "./actions";

const hora = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function CalendarioForm({ inicio, fim }: { inicio: number; fim: number }) {
  const [estado, acao, pendente] = useActionState(salvarFaixaCalendario, null);
  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:w-80">
        <div className="flex flex-col gap-2">
          <Label htmlFor="calendario_hora_inicio">De</Label>
          <NativeSelect id="calendario_hora_inicio" name="calendario_hora_inicio" defaultValue={String(inicio)} className="numero w-full">
            {Array.from({ length: 24 }, (_, h) => (
              <NativeSelectOption key={h} value={h}>
                {hora(h)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="calendario_hora_fim">Até</Label>
          <NativeSelect id="calendario_hora_fim" name="calendario_hora_fim" defaultValue={String(fim)} className="numero w-full">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <NativeSelectOption key={h} value={h}>
                {hora(h)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      {estado &&
        (estado.ok ? (
          <p role="status" className="flex items-center gap-2 type-body-medium text-on-surface-variant">
            <CheckIcon className="size-4 text-concluido" aria-hidden />
            {estado.mensagem}
          </p>
        ) : (
          <ErroFormulario>{estado.mensagem}</ErroFormulario>
        ))}
      <Button type="submit" disabled={pendente} className="w-fit">
        {pendente ? "Salvando…" : "Salvar faixa"}
      </Button>
    </form>
  );
}
