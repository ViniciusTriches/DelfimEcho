"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { enviarSemResetar } from "@/lib/form";
import type { Linha } from "@/lib/tipos";
import { salvarMetrica } from "./actions";

const UNIDADES = ["R$", "kg", "%", "qtd", "h", "km", "min"];

type Props = {
  metrica?: Linha<"metrics">;
  areas: { id: string; nome: string }[];
  areaInicial?: string | null;
  voltar: string;
};

export function MetricaForm({ metrica, areas, areaInicial, voltar }: Props) {
  const [estado, acao, pendente] = useActionState(salvarMetrica, null);

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
      {metrica && <input type="hidden" name="id" value={metrica.id} />}
      <input type="hidden" name="voltar" value={metrica ? `/metricas/${metrica.id}` : ""} />

      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={metrica?.nome}
            required
            maxLength={60}
            autoFocus={!metrica}
            placeholder="Ex.: Peso"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="unidade">Unidade</Label>
          <Input
            id="unidade"
            name="unidade"
            defaultValue={metrica?.unidade ?? ""}
            maxLength={12}
            list="unidades"
            placeholder="kg, R$, %…"
          />
          <datalist id="unidades">
            {UNIDADES.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="area_id">Área</Label>
        <NativeSelect
          id="area_id"
          name="area_id"
          defaultValue={metrica?.area_id ?? areaInicial ?? areas[0]?.id}
          className="w-full"
          required
        >
          {areas.map((a) => (
            <NativeSelectOption key={a.id} value={a.id}>
              {a.nome}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">O que é melhor?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { valor: "maior_melhor", nome: "Subir", descricao: "ex.: faturamento" },
            { valor: "menor_melhor", nome: "Descer", descricao: "ex.: peso, % de gordura" },
          ].map((d) => (
            <label
              key={d.valor}
              className="flex min-h-11 cursor-pointer flex-col justify-center rounded-lg border px-3 py-2 transition-colors duration-150 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="direcao"
                value={d.valor}
                defaultChecked={(metrica?.direcao ?? "maior_melhor") === d.valor}
                className="sr-only"
              />
              <span className="text-sm font-medium">{d.nome}</span>
              <span className="text-xs text-muted-foreground">{d.descricao}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meta_valor">
          Meta <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="meta_valor"
          name="meta_valor"
          type="number"
          inputMode="decimal"
          step="any"
          defaultValue={metrica?.meta_valor ?? ""}
          className="w-44"
        />
        <p className="text-xs text-muted-foreground">Aparece como linha de referência no gráfico.</p>
      </div>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente} className="min-h-11 sm:min-h-8">
          {pendente ? "Salvando…" : metrica ? "Salvar" : "Criar métrica"}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: "ghost", className: "min-h-11 sm:min-h-8" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
