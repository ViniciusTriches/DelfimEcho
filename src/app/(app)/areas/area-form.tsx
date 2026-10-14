"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckIcon } from "lucide-react";
import { ICONES_AREA } from "@/components/area-icon";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HEX_SLOT, NOMES_SLOT, SLOTS_AREA, slotDaCor } from "@/lib/cores-area";
import { enviarSemResetar } from "@/lib/form";
import type { Area } from "@/lib/tipos";
import { salvarArea } from "./actions";

export function AreaForm({ area, cancelarHref }: { area?: Area; cancelarHref: string }) {
  const [estado, acao, pendente] = useActionState(salvarArea, null);

  // Cor antiga conhecida → pré-seleciona a cor terrosa equivalente; cor personalizada fica como opção.
  const slotAtual = area ? slotDaCor(area.cor) : SLOTS_AREA[0];
  const personalizada = area && !slotAtual ? area.cor : null;
  const iconeAtual = area?.icone ?? "target";

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-8">
      {area && <input type="hidden" name="id" value={area.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={area?.nome} required maxLength={60} autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" defaultValue={area?.descricao ?? ""} rows={2} maxLength={200} />
      </div>

      <fieldset className="flex flex-col">
        <legend className="mb-3 type-title-small text-on-surface">Cor</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SLOTS_AREA.map((slot) => (
            <label key={slot} className="opcao flex flex-col items-center gap-1.5 px-1 py-2.5">
              <input
                type="radio"
                name="cor"
                value={HEX_SLOT[slot]}
                defaultChecked={slot === slotAtual}
                className="peer sr-only"
              />
              <span
                className="flex size-8 items-center justify-center rounded-full text-surface [&>svg]:hidden peer-checked:[&>svg]:block"
                style={{ backgroundColor: `var(--md-terra-${slot})` }}
              >
                <CheckIcon className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="type-label-medium">{NOMES_SLOT[slot]}</span>
            </label>
          ))}
          {personalizada && (
            <label className="opcao flex flex-col items-center gap-1.5 px-1 py-2.5">
              <input type="radio" name="cor" value={personalizada} defaultChecked className="peer sr-only" />
              <span
                className="flex size-8 items-center justify-center rounded-full text-surface [&>svg]:hidden peer-checked:[&>svg]:block"
                style={{ backgroundColor: personalizada }}
              >
                <CheckIcon className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="type-label-medium">Atual</span>
            </label>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className="mb-3 type-title-small text-on-surface">Ícone</legend>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {Object.entries(ICONES_AREA).map(([nome, Icone]) => (
            <label key={nome} title={nome} className="opcao flex aspect-square items-center justify-center sm:aspect-auto sm:h-12">
              <input type="radio" name="icone" value={nome} defaultChecked={nome === iconeAtual} className="sr-only" />
              <Icone className="size-5" aria-hidden />
              <span className="sr-only">{nome}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {estado?.erro && (
        <ErroFormulario>{estado.erro}</ErroFormulario>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : area ? "Salvar" : "Criar área"}
        </Button>
        <Link href={cancelarHref} className={buttonVariants({ variant: "text" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
