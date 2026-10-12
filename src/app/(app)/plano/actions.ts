"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { hojeSP, inicioSemana } from "@/lib/datas";
import { ehUuid } from "@/lib/uuid";
import { createClient } from "@/lib/supabase/server";

export type EstadoPlano = { erro: string } | null;

/** Salva o plano da semana atual: campo vazio remove a área do plano. */
export async function salvarPlano(_anterior: EstadoPlano, dados: FormData): Promise<EstadoPlano> {
  await getUsuario();
  const supabase = await createClient();
  const semana = inicioSemana(hojeSP());

  const salvar: { semana: string; area_id: string; horas: number }[] = [];
  const remover: string[] = [];
  for (const [chave, valor] of dados.entries()) {
    if (!chave.startsWith("horas_")) continue;
    const areaId = chave.slice(6);
    if (!ehUuid(areaId)) continue;
    const texto = String(valor).trim().replace(",", ".");
    if (texto === "") {
      remover.push(areaId);
      continue;
    }
    const horas = Number(texto);
    if (Number.isNaN(horas) || horas < 0 || horas > 168) return { erro: "As horas vão de 0 a 168 por área." };
    salvar.push({ semana, area_id: areaId, horas });
  }

  if (salvar.length) {
    const { error } = await supabase.from("weekly_plans").upsert(salvar, { onConflict: "user_id,semana,area_id" });
    if (error) return { erro: `Não foi possível salvar o plano. (${error.code})` };
  }
  if (remover.length) {
    const { error } = await supabase.from("weekly_plans").delete().eq("semana", semana).in("area_id", remover);
    if (error) return { erro: `Não foi possível salvar o plano. (${error.code})` };
  }

  revalidatePath("/", "layout");
  redirect("/#semana");
}
