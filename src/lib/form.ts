import { startTransition, type FormEvent } from "react";

/**
 * onSubmit que chama a action do useActionState sem o reset automático do React 19
 * (que apagaria o que foi digitado quando a action devolve um erro de validação).
 */
export function enviarSemResetar(acao: (dados: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    startTransition(() => acao(dados));
  };
}

export function texto(dados: FormData, campo: string): string {
  return String(dados.get(campo) ?? "").trim();
}

export function textoOuNulo(dados: FormData, campo: string): string | null {
  return texto(dados, campo) || null;
}

/** Número do formulário (aceita vírgula decimal). NaN se vazio ou inválido. */
export function numero(dados: FormData, campo: string): number {
  const valor = texto(dados, campo).replace(",", ".");
  return valor === "" ? NaN : Number(valor);
}
