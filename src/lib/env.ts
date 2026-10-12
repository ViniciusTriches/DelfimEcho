// Variáveis obrigatórias. Cada uma é lida pelo nome literal porque as NEXT_PUBLIC_*
// são substituídas no build e não funcionam com acesso dinâmico (process.env[nome]).
const OBRIGATORIAS = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ALLOWED_EMAIL: process.env.ALLOWED_EMAIL,
};

/** Nomes das variáveis de ambiente obrigatórias que estão vazias ou ausentes. */
export function variaveisFaltando(): string[] {
  return Object.entries(OBRIGATORIAS)
    .filter(([, valor]) => !valor?.trim())
    .map(([nome]) => nome);
}
