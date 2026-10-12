"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CORES_AREA, ICONES_AREA } from "@/components/area-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarSemResetar } from "@/lib/form";
import type { Area } from "@/lib/tipos";
import { salvarArea } from "./actions";

export function AreaForm({ area, cancelarHref }: { area?: Area; cancelarHref: string }) {
  const [estado, acao, pendente] = useActionState(salvarArea, null);

  const corAtual = area?.cor ?? CORES_AREA[0];
  // Mantém uma cor personalizada (fora da paleta) como opção.
  const cores = CORES_AREA.includes(corAtual) ? CORES_AREA : [...CORES_AREA, corAtual];
  const iconeAtual = area?.icone ?? "target";

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
      {area && <input type="hidden" name="id" value={area.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={area?.nome} required maxLength={60} autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={area?.descricao ?? ""}
          rows={2}
          maxLength={200}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Cor</legend>
        <div className="flex flex-wrap gap-2">
          {cores.map((cor) => (
            <label
              key={cor}
              className="size-8 cursor-pointer rounded-full ring-offset-2 ring-offset-background has-checked:ring-2 has-checked:ring-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
              style={{ backgroundColor: cor }}
            >
              <input
                type="radio"
                name="cor"
                value={cor}
                defaultChecked={cor === corAtual}
                className="sr-only"
              />
              <span className="sr-only">{cor}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Ícone</legend>
        <div className="grid grid-cols-8 gap-2 sm:flex sm:flex-wrap">
          {Object.entries(ICONES_AREA).map(([nome, Icone]) => (
            <label
              key={nome}
              title={nome}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border text-muted-foreground has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary has-focus-visible:ring-2 has-focus-visible:ring-ring"
            >
              <input
                type="radio"
                name="icone"
                value={nome}
                defaultChecked={nome === iconeAtual}
                className="sr-only"
              />
              <Icone className="size-5" aria-hidden />
              <span className="sr-only">{nome}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : area ? "Salvar" : "Criar área"}
        </Button>
        <Link href={cancelarHref} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
