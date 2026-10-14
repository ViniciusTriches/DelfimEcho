"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AreaSkillSelect, type OpcaoArea, type OpcaoSkill } from "@/components/area-skill-select";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarSemResetar } from "@/lib/form";
import type { Linha } from "@/lib/tipos";
import { salvarMeta } from "./actions";

type Props = {
  meta?: Linha<"goals">;
  areas: OpcaoArea[];
  skills: OpcaoSkill[];
  areaInicial?: string | null;
  skillInicial?: string | null;
  voltar: string;
};

export function MetaForm({ meta, areas, skills, areaInicial, skillInicial, voltar }: Props) {
  const [estado, acao, pendente] = useActionState(salvarMeta, null);

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-8">
      {meta && <input type="hidden" name="id" value={meta.id} />}
      <input type="hidden" name="voltar" value={voltar} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Meta</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={meta?.titulo}
          required
          maxLength={120}
          autoFocus={!meta}
          placeholder="Ex.: Fechar 5 clientes novos"
        />
      </div>

      <AreaSkillSelect
        areas={areas}
        skills={skills}
        areaInicial={meta?.area_id ?? areaInicial}
        skillInicial={meta?.skill_id ?? skillInicial}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="criterio_de_conclusao">Critério de conclusão</Label>
        <Textarea
          id="criterio_de_conclusao"
          name="criterio_de_conclusao"
          defaultValue={meta?.criterio_de_conclusao ?? ""}
          rows={2}
          maxLength={400}
          placeholder="Como você vai saber, sem dúvida, que concluiu?"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="prazo">
          Prazo <span className="text-on-surface-variant">(opcional)</span>
        </Label>
        <Input id="prazo" name="prazo" type="date" defaultValue={meta?.prazo ?? ""} className="w-44" />
      </div>

      {estado?.erro && (
        <ErroFormulario>{estado.erro}</ErroFormulario>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : meta ? "Salvar" : "Criar meta"}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: "text" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
