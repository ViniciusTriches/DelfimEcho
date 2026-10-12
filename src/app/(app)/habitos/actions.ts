"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { hojeSP } from "@/lib/datas";
import { texto } from "@/lib/form";
import { mover } from "@/lib/ordem";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

const DIA_VALIDO = /^\d{4}-\d{2}-\d{2}$/;

/** Marca ou desmarca um hábito num dia (não permite dias futuros). */
export async function marcarHabito(habitId: string, dia: string, feito: boolean) {
  await getUsuario();
  if (!ehUuid(habitId) || !DIA_VALIDO.test(dia)) return { erro: "Dados inválidos." };
  if (dia > hojeSP()) return { erro: "Não dá para marcar um dia que ainda não chegou." };

  const supabase = await createClient();
  const { error } = feito
    ? await supabase
        .from("habit_logs")
        .upsert({ habit_id: habitId, data: dia, concluido: true }, { onConflict: "habit_id,data" })
    : await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("data", dia);
  if (error) return { erro: `Não foi possível salvar. (${error.code})` };
  revalidatePath("/", "layout");
}

export type EstadoForm = { erro: string } | null;

/** Cria (sem id) ou atualiza (com id) um hábito. */
export async function salvarHabito(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const nome = texto(dados, "nome");
  const areaId = texto(dados, "area_id");
  const frequencia = texto(dados, "frequencia") === "dias_semana" ? "dias_semana" : "diario";
  const dias = [...new Set(dados.getAll("dias").map(Number))].filter((d) => d >= 1 && d <= 7).sort();
  const inicio = texto(dados, "inicio");

  if (!nome) return { erro: "Dê um nome para o hábito." };
  if (areaId && !ehUuid(areaId)) return { erro: "Área inválida." };
  if (frequencia === "dias_semana" && dias.length === 0) return { erro: "Escolha pelo menos um dia da semana." };
  if (!DIA_VALIDO.test(inicio)) return { erro: "Informe desde quando acompanhar." };

  const campos = {
    nome,
    area_id: areaId || null,
    frequencia,
    dias_semana: frequencia === "dias_semana" ? dias : null,
    inicio,
  };

  if (id) {
    const { error } = await supabase.from("habits").update(campos).eq("id", id);
    if (error) return { erro: `Não foi possível salvar. (${error.code})` };
  } else {
    const { data: ultimo } = await supabase
      .from("habits")
      .select("ordem")
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("habits").insert({ ...campos, ordem: (ultimo?.ordem ?? -1) + 1 });
    if (error) return { erro: `Não foi possível criar. (${error.code})` };
  }

  revalidatePath("/", "layout");
  redirect("/habitos/gerenciar");
}

export async function alternarAtivo(id: string, ativo: boolean) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("habits").update({ ativo }).eq("id", id);
  if (error) return { erro: `Não foi possível ${ativo ? "retomar" : "pausar"}. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function excluirHabito(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/habitos/gerenciar");
}

export async function moverHabito(id: string, direcao: "cima" | "baixo") {
  await getUsuario();
  const supabase = await createClient();
  const { data } = await supabase.from("habits").select("id").eq("ativo", true).order("ordem");
  await mover(supabase, "habits", (data ?? []).map((h) => h.id), id, direcao);
  revalidatePath("/", "layout");
}
