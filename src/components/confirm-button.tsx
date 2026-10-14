"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** Server action a executar (após a confirmação, se houver). Pode devolver { erro }. */
  acao: () => Promise<{ erro?: string } | void>;
  /** Pergunta do dialog de confirmação. Sem ela, executa direto. */
  confirmar?: string;
  /** Rótulo do botão que confirma (padrão: o verbo da pergunta, ex.: "Excluir"). */
  rotuloConfirmar?: string;
};

const VERBOS = ["Excluir", "Arquivar", "Abandonar", "Pausar", "Descartar", "Restaurar", "Concluir"];

/** Título curto + texto: a primeira frase vira título; o resto, a explicação. */
function separar(texto: string) {
  const [primeiro, ...resto] = texto.split(/\n\n/);
  if (primeiro.length <= 70 && !resto.length) return { titulo: primeiro, descricao: null };
  if (primeiro.length <= 70) return { titulo: primeiro, descricao: resto.join("\n\n") };
  return { titulo: "Tem certeza?", descricao: texto };
}

export function ConfirmButton({ acao, confirmar, rotuloConfirmar, children, disabled, variant, ...props }: Props) {
  const [pendente, startTransition] = useTransition();
  const [aberto, setAberto] = useState(false);

  // A ação roda em segundo plano: o dialog fecha na hora, nada espera a resposta.
  function executar() {
    setAberto(false);
    startTransition(async () => {
      const resultado = await acao();
      if (resultado?.erro) toast.error(resultado.erro);
    });
  }

  const botao = (
    <Button
      type="button"
      variant={variant}
      disabled={disabled || pendente}
      onClick={() => (confirmar ? setAberto(true) : executar())}
      {...props}
    >
      {children}
    </Button>
  );
  if (!confirmar) return botao;

  const { titulo, descricao } = separar(confirmar);
  const destrutiva = variant === "destructive" || /^(Excluir|Descartar)/.test(confirmar);
  const rotulo = rotuloConfirmar ?? VERBOS.find((v) => confirmar.startsWith(v)) ?? "Confirmar";

  return (
    <>
      {botao}
      <AlertDialog open={aberto} onOpenChange={setAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titulo}</AlertDialogTitle>
            {descricao && <AlertDialogDescription>{descricao}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="text" className={cn(destrutiva && "text-error")} onClick={executar} autoFocus>
              {rotulo}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
