"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarMagicLink } from "./actions";

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(enviarMagicLink, null);
  const erroLink = useSearchParams().get("erro") === "link";

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
        />
      </div>

      <Button type="submit" disabled={enviando} className="h-10">
        {enviando ? "Enviando…" : "Enviar link de acesso"}
      </Button>

      {estado && (
        <p
          role="status"
          className={estado.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}
        >
          {estado.mensagem}
        </p>
      )}

      {!estado && erroLink && (
        <p role="alert" className="text-sm text-destructive">
          O link é inválido ou expirou. Peça um novo.
        </p>
      )}
    </form>
  );
}
