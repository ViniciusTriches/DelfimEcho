"use client";

import { useActionState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar } from "./actions";

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, null);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
      </div>

      {estado && (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-error-container px-4 py-3 type-body-medium text-on-error-container">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {estado.mensagem}
            {estado.codigo && <span className="opacity-80"> ({estado.codigo})</span>}
          </span>
        </p>
      )}

      <Button type="submit" size="lg" disabled={enviando} className="mt-2 w-full">
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
