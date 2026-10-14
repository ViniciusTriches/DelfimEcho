"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CalendarDaysIcon, RepeatIcon } from "lucide-react";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { enviarSemResetar } from "@/lib/form";
import { NOMES_DIAS } from "@/lib/habitos";
import type { Linha } from "@/lib/tipos";
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
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-8">
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
        <legend className="mb-3 type-title-small text-on-surface">Frequência</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { valor: "diario", nome: "Todos os dias", Icone: RepeatIcon },
            { valor: "dias_semana", nome: "Dias específicos", Icone: CalendarDaysIcon },
          ].map((f) => (
            <label
              key={f.valor}
              className="opcao flex min-h-14 items-center gap-3 px-4 type-title-small"
            >
              <input
                type="radio"
                name="frequencia"
                value={f.valor}
                checked={frequencia === f.valor}
                onChange={() => setFrequencia(f.valor)}
                className="sr-only"
              />
              <f.Icone className="size-5 shrink-0" aria-hidden />
              {f.nome}
            </label>
          ))}
        </div>

        {frequencia === "dias_semana" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
            {NOMES_DIAS.map((nome, i) => (
              <label
                key={nome}
                className="opcao flex size-12 items-center justify-center rounded-full type-label-large has-checked:bg-primary has-checked:text-on-primary"
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
        <Input id="inicio" name="inicio" type="date" defaultValue={habito?.inicio ?? hoje} className="w-48" required />
        <p className="type-body-small text-on-surface-variant">
          Dias antes desta data não contam como falha nem quebram a sequência.
        </p>
      </div>

      {estado?.erro && (
        <ErroFormulario>{estado.erro}</ErroFormulario>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : habito ? "Salvar" : "Criar hábito"}
        </Button>
        <Link href="/habitos/gerenciar" className={buttonVariants({ variant: "text" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
