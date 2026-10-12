"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AreaSkillSelect, type OpcaoArea, type OpcaoSkill } from "@/components/area-skill-select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enviarSemResetar } from "@/lib/form";
import type { Linha } from "@/lib/tipos";
import { salvarMarco } from "./actions";

type Props = {
  marco?: Linha<"milestones">;
  areas: OpcaoArea[];
  skills: OpcaoSkill[];
  inicial?: { titulo?: string; area?: string | null; skill?: string | null; data?: string };
  hoje: string;
  voltar: string;
};

export function MarcoForm({ marco, areas, skills, inicial = {}, hoje, voltar }: Props) {
  const [estado, acao, pendente] = useActionState(salvarMarco, null);

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
      {marco && <input type="hidden" name="id" value={marco.id} />}
      <input type="hidden" name="voltar" value={voltar} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Conquista</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={marco?.titulo ?? inicial.titulo}
          required
          maxLength={120}
          autoFocus={!marco}
          placeholder="Ex.: Primeira conversa de 30 min em inglês"
        />
      </div>

      <AreaSkillSelect
        areas={areas}
        skills={skills}
        areaInicial={marco?.area_id ?? inicial.area}
        skillInicial={marco?.skill_id ?? inicial.skill}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="data">Data</Label>
        <Input
          id="data"
          name="data"
          type="date"
          defaultValue={marco?.data ?? inicial.data ?? hoje}
          max={hoje}
          className="w-44"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">
          Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={marco?.descricao ?? ""}
          rows={3}
          maxLength={600}
          placeholder="O que aconteceu e por que importa"
        />
      </div>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente} className="min-h-11 sm:min-h-8">
          {pendente ? "Salvando…" : marco ? "Salvar" : "Registrar marco"}
        </Button>
        <Link href={voltar} className={buttonVariants({ variant: "ghost", className: "min-h-11 sm:min-h-8" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
