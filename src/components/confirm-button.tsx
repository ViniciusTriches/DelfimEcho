"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** Server action a executar após a confirmação. Pode devolver { erro }. */
  acao: () => Promise<{ erro?: string } | void>;
  /** Texto do confirm(). Sem ele, executa direto. */
  confirmar?: string;
};

export function ConfirmButton({ acao, confirmar, children, disabled, ...props }: Props) {
  const [pendente, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={disabled || pendente}
      onClick={() => {
        if (confirmar && !window.confirm(confirmar)) return;
        startTransition(async () => {
          const resultado = await acao();
          if (resultado?.erro) toast.error(resultado.erro);
        });
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
