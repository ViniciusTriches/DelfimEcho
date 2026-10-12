"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { enviarSemResetar } from "@/lib/form";
import { NOMES_DIAS } from "@/lib/habitos";
import type { Linha } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { salvarHabito } from "./actions";

type Props = {
  habito?: Linha<"habits">;
  areas: { id: string; nome: string }[];
  hoje: string;
};

export function HabitoForm({ habito, areas, hoje }: Props) {
  const [estado, acao, pendente] = useActionState(salvarHabito, null);
  const [frequencia, setFrequencia] = useState(habito?.frequencia ?? "diario");

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
      {habito && <input type="hidden" name="id" value={habito.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={habito?.nome}
          required
          maxLength={80}
          autoFocus={!habito}
          placeholder="Ex.: Ler 20 páginas"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="area_id">Área</Label>
        <NativeSelect id="area_id" name="area_id" defaultValue={habito?.area_id ?? ""} className="w-full">
          <NativeSelectOption value="">Nenhuma</NativeSelectOption>
          {areas.map((a) => (
            <NativeSelectOption key={a.id} value={a.id}>
              {a.nome}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Frequência</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { valor: "diario", nome: "Todos os dias" },
            { valor: "dias_semana", nome: "Dias específicos" },
          ].map((f) => (
            <label
              key={f.valor}
              className="flex min-h-11 cursor-pointer items-center rounded-lg border px-3 text-sm transition-colors duration-150 has-checked:border-primary has-checked:bg-primary/5 has-checked:font-medium has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="frequencia"
                value={f.valor}
                checked={frequencia === f.valor}
                onChange={() => setFrequencia(f.valor)}
                className="sr-only"
              />
              {f.nome}
            </label>
          ))}
        </div>

        {frequencia === "dias_semana" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
            {NOMES_DIAS.map((nome, i) => (
              <label
                key={nome}
                className={cn(
                  "flex size-11 cursor-pointer items-center justify-center rounded-full border text-sm transition-colors duration-150",
                  "has-checked:border-primary has-checked:bg-primary has-checked:font-medium has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                )}
              >
                <input
                  type="checkbox"
                  name="dias"
                  value={i + 1}
                  defaultChecked={habito?.dias_semana?.includes(i + 1) ?? i < 5}
                  className="sr-only"
                />
                {nome}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="inicio">Acompanhar desde</Label>
        <Input id="inicio" name="inicio" type="date" defaultValue={habito?.inicio ?? hoje} className="w-44" required />
        <p className="text-xs text-muted-foreground">
          Dias antes desta data não contam como falha nem quebram a sequência.
        </p>
      </div>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente} className="min-h-11 sm:min-h-8">
          {pendente ? "Salvando…" : habito ? "Salvar" : "Criar hábito"}
        </Button>
        <Link href="/habitos/gerenciar" className={buttonVariants({ variant: "ghost", className: "min-h-11 sm:min-h-8" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
