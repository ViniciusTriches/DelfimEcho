"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export type OpcaoArea = { id: string; nome: string };
export type OpcaoSkill = { id: string; nome: string; area_id: string };

/** Área (obrigatória ou não) + habilidade opcional filtrada pela área escolhida. */
export function AreaSkillSelect({
  areas,
  skills,
  areaInicial,
  skillInicial,
  areaObrigatoria = true,
}: {
  areas: OpcaoArea[];
  skills: OpcaoSkill[];
  areaInicial?: string | null;
  skillInicial?: string | null;
  areaObrigatoria?: boolean;
}) {
  const [area, setArea] = useState(areaInicial ?? (areaObrigatoria ? (areas[0]?.id ?? "") : ""));
  const [skill, setSkill] = useState(skillInicial ?? "");
  const daArea = skills.filter((s) => s.area_id === area);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="area_id">Área</Label>
        <NativeSelect
          id="area_id"
          name="area_id"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setSkill("");
          }}
          className="w-full"
          required={areaObrigatoria}
        >
          {!areaObrigatoria && <NativeSelectOption value="">Nenhuma</NativeSelectOption>}
          {areas.map((a) => (
            <NativeSelectOption key={a.id} value={a.id}>
              {a.nome}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="skill_id">
          Habilidade <span className="font-normal text-on-surface-variant">(opcional)</span>
        </Label>
        <NativeSelect
          id="skill_id"
          name="skill_id"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full"
          disabled={daArea.length === 0}
        >
          <NativeSelectOption value="">{daArea.length ? "Nenhuma" : "Nenhuma nesta área"}</NativeSelectOption>
          {daArea.map((s) => (
            <NativeSelectOption key={s.id} value={s.id}>
              {s.nome}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
