import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Áreas e habilidades ativas para seletores de formulário e filtros. */
export async function carregarOpcoes() {
  const supabase = await createClient();
  const [{ data: areas }, { data: skills }] = await Promise.all([
    supabase.from("areas").select("id, nome, cor").eq("arquivada", false).order("ordem"),
    supabase.from("skills").select("id, nome, area_id").eq("arquivada", false).order("ordem"),
  ]);
  return { areas: areas ?? [], skills: skills ?? [] };
}

/** Lê um parâmetro de busca que deve ser um uuid. */
export function parametroUuid(valor: string | string[] | undefined): string | null {
  return typeof valor === "string" && /^[0-9a-f-]{36}$/i.test(valor) ? valor : null;
}
