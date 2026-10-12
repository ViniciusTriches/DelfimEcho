"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar } from "./actions";

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(entrar, null);

  return (
    <form action={acao} className="flex flex-col gap-4">
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

      <Button type="submit" disabled={enviando} className="h-10">
        {enviando ? "Entrando…" : "Entrar"}
      </Button>

      {estado && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensagem}
          {estado.codigo && <span className="text-xs opacity-70"> ({estado.codigo})</span>}
        </p>
      )}
    </form>
  );
}
