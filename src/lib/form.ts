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

/** Caminho interno para onde voltar depois de salvar (evita redirecionar para fora do app). */
export function destinoSeguro(valor: string, padrao: string): string {
  return valor.startsWith("/") && !valor.startsWith("//") ? valor : padrao;
}

export const DIA_VALIDO = /^\d{4}-\d{2}-\d{2}$/;

/** Número do formulário (aceita vírgula decimal). NaN se vazio ou inválido. */
export function numero(dados: FormData, campo: string): number {
  const valor = texto(dados, campo).replace(",", ".");
  return valor === "" ? NaN : Number(valor);
}
