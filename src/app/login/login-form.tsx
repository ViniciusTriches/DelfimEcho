"use client";

import { useActionState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enviarMagicLink } from "./actions";

const MENSAGENS: Record<string, string> = {
  otp_expired:
    "O link expirou ou já foi usado. Peça um novo. Se acontecer sempre, seu provedor de e-mail pode estar abrindo o link antes de você.",
  flow_state_expired: "O link expirou. Peça um novo.",
  pkce_code_verifier_not_found:
    "Abra o link no mesmo navegador em que você pediu o acesso. No celular, evite o navegador interno do app de e-mail.",
  flow_state_not_found:
    "Abra o link no mesmo navegador em que você pediu o acesso, usando o link mais recente.",
  bad_code_verifier:
    "Este link foi pedido em outro navegador. Peça um novo aqui mesmo e abra-o neste navegador.",
};

// Alguns erros do Supabase chegam no fragmento da URL (#error_code=…), que o
// servidor não vê. O navegador preserva o fragmento nos redirects até aqui.
function erroDoFragmento() {
  return new URLSearchParams(window.location.hash.slice(1)).get("error_code") ?? "";
}
const semInscricao = () => () => {};

export function LoginForm() {
  const [estado, acao, enviando] = useActionState(enviarMagicLink, null);
  const erroNaUrl = useSearchParams().get("erro");
  const erroNoFragmento = useSyncExternalStore(semInscricao, erroDoFragmento, () => "");
  const erro = erroNoFragmento || erroNaUrl;

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

      {estado?.ok && (
        <p className="text-sm text-muted-foreground">
          Abra o link neste mesmo navegador.
        </p>
      )}

      {!estado && erro && (
        <p role="alert" className="text-sm text-destructive">
          {MENSAGENS[erro] ?? "Não foi possível entrar com este link. Peça um novo."}{" "}
          <span className="text-xs opacity-70">({erro})</span>
        </p>
      )}
    </form>
  );
}
