"use client";

import { useTransition } from "react";
import { TimerIcon } from "lucide-react";
import { toast } from "sonner";
import { iniciarTimer } from "@/app/(app)/timer/actions";
import { Button } from "@/components/ui/button";

/** Inicia o timer já com habilidade e foco (vai para a tela do timer). */
export function BotaoIniciarTimer({
  skillId,
  foco,
  ...props
}: { skillId: string; foco: string } & Omit<React.ComponentProps<typeof Button>, "onClick">) {
  const [pendente, start] = useTransition();
  return (
    <Button
      {...props}
      disabled={pendente || props.disabled}
      onClick={() =>
        start(async () => {
          const r = await iniciarTimer(skillId, foco);
          if (r?.erro) toast.error(r.erro);
        })
      }
    >
      <TimerIcon />
      {pendente ? "Iniciando…" : (props.children ?? "Iniciar timer")}
    </Button>
  );
}
