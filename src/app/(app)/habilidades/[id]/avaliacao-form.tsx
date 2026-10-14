"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { enviarSemResetar } from "@/lib/form";
import { salvarAvaliacao } from "../actions";

export function AvaliacaoForm({ skillId, hoje, nivelAtual }: { skillId: string; hoje: string; nivelAtual: number | null }) {
  const [estado, acao, pendente] = useActionState(salvarAvaliacao, null);
  // Após salvar, remonta os campos vazios para a próxima avaliação.
  const [chave, setChave] = useState(0);
  const [ultimoOk, setUltimoOk] = useState<typeof estado>(null);
  if (estado?.ok && estado !== ultimoOk) {
    setUltimoOk(estado);
    setChave((c) => c + 1);
  }

  return (
    <form key={chave} onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-4">
      <input type="hidden" name="skill_id" value={skillId} />
      <div className="grid grid-cols-[6rem_1fr] gap-3 sm:grid-cols-[6rem_10rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nivel">Nível (1–10)</Label>
          <NativeSelect id="nivel" name="nivel" defaultValue={nivelAtual?.toString() ?? ""} className="w-full" required>
            <NativeSelectOption value="" disabled>
              —
            </NativeSelectOption>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <NativeSelectOption key={n} value={n}>
                {n}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="data_avaliacao">Data</Label>
          <Input id="data_avaliacao" name="data" type="date" defaultValue={hoje} max={hoje} required />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="observacao">Observação</Label>
        <Input id="observacao" name="observacao" maxLength={300} placeholder="Por que esse nível? O que mudou?" />
      </div>
      {estado && (
        <p role="status" className={estado.ok ? "type-body-medium text-on-surface-variant" : "type-body-medium text-error"}>
          {estado.mensagem}
        </p>
      )}
      <Button type="submit" variant="secondary" disabled={pendente} className="w-fit">
        {pendente ? "Salvando…" : "Registrar autoavaliação"}
      </Button>
    </form>
  );
}
