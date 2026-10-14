"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";

/** Opção liga/desliga de formulário (item de lista M3): rótulo + explicação + switch à direita. */
export function CampoSwitch({
  name,
  titulo,
  descricao,
  defaultChecked = false,
}: {
  name: string;
  titulo: string;
  descricao?: string;
  defaultChecked?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low px-4 py-3">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block type-body-large text-on-surface">{titulo}</span>
        {descricao && <span className="block type-body-small text-on-surface-variant">{descricao}</span>}
      </label>
      <Switch id={id} name={name} value="on" defaultChecked={defaultChecked} />
    </div>
  );
}
