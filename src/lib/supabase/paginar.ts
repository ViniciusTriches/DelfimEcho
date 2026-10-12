const PAGINA = 1000; // limite padrão de linhas por resposta da API do Supabase

/**
 * Busca todas as linhas de uma consulta, página por página. A consulta precisa ter
 * ordem estável (ex.: .order("data").order("id")) para não pular nem repetir linhas.
 */
export async function todasAsLinhas<T>(
  consulta: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const linhas: T[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await consulta(de, de + PAGINA - 1);
    if (error) throw new Error(error.message);
    linhas.push(...(data ?? []));
    if (!data || data.length < PAGINA) return linhas;
  }
}
