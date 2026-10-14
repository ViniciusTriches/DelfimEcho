"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { CampoSwitch } from "@/components/campo-switch";
import { ErroFormulario } from "@/components/erro-formulario";
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
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-8">
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
        <legend className="mb-3 type-title-small text-on-surface">O que é melhor?</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { valor: "maior_melhor", nome: "Subir", descricao: "ex.: faturamento", Icone: TrendingUpIcon },
            { valor: "menor_melhor", nome: "Descer", descricao: "ex.: peso, % de gordura", Icone: TrendingDownIcon },
          ].map((d) => (
            <label
              key={d.valor}
              className="opcao flex min-h-16 items-center gap-3 p-4"
            >
              <input
                type="radio"
                name="direcao"
                value={d.valor}
                defaultChecked={(metrica?.direcao ?? "maior_melhor") === d.valor}
                className="sr-only"
              />
              <d.Icone className="size-5 shrink-0" aria-hidden />
              <span className="flex flex-col">
                <span className="type-title-small">{d.nome}</span>
                <span className="type-body-small opacity-80">{d.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="meta_valor">
          Meta <span className="text-on-surface-variant">(opcional)</span>
        </Label>
        <Input
          id="meta_valor"
          name="meta_valor"
          type="number"
          inputMode="decimal"
          step="any"
          defaultValue={metrica?.meta_valor ?? ""}
          className="numero w-44"
        />
        <p className="type-body-small text-on-surface-variant">Aparece como linha de referência no gráfico.</p>
      </div>

      <CampoSwitch
        name="no_dashboard"
        titulo="Mostrar no início"
        descricao="Atalho de registro rápido no início (ex.: peso)."
        defaultChecked={metrica?.no_dashboard ?? false}
      />

      {estado?.erro && (
        <ErroFormulario>{estado.erro}</ErroFormulario>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : metrica ? "Salvar" : "Criar métrica"}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: "text" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
