import "server-only";
import type { createClient } from "@/lib/supabase/server";

type Cliente = Awaited<ReturnType<typeof createClient>>;

/**
 * Move um item uma posição para cima/baixo numa lista ordenada e regrava
 * `ordem` = 0, 1, 2… para todos (corrige empates de quebra).
 */
export async function mover(
  supabase: Cliente,
  tabela: "areas" | "skills" | "habits",
  ids: string[],
  id: string,
  direcao: "cima" | "baixo",
) {
  const i = ids.indexOf(id);
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;

  const nova = [...ids];
  [nova[i], nova[j]] = [nova[j], nova[i]];

  await Promise.all(
    nova.map((itemId, ordem) => supabase.from(tabela).update({ ordem }).eq("id", itemId)),
  );
}
