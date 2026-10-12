"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

type Resultado = { erro?: string } | void;

// Um timer por usuário (active_timer.user_id é único), compartilhado entre aparelhos.

export async function iniciarTimer(skillId: string, foco: string): Promise<Resultado> {
  const usuario = await getUsuario();
  if (!ehUuid(skillId)) return { erro: "Escolha a habilidade." };
  const supabase = await createClient();

  const { data: existente } = await supabase.from("active_timer").select("id").maybeSingle();
  if (existente) return { erro: "Já existe um timer ativo. Encerre ou descarte antes de iniciar outro." };

  const { error } = await supabase.from("active_timer").insert({
    user_id: usuario.id,
    skill_id: skillId,
    foco_especifico: foco.trim() || null,
  });
  if (error) return { erro: `Não foi possível iniciar o timer. (${error.code})` };

  revalidatePath("/", "layout");
  redirect("/timer");
}

export async function pausarTimer(): Promise<Resultado> {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase
    .from("active_timer")
    .update({ pausado_em: new Date().toISOString() })
    .is("pausado_em", null);
  if (error) return { erro: `Não foi possível pausar. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function retomarTimer(): Promise<Resultado> {
  await getUsuario();
  const supabase = await createClient();
  const { data: timer } = await supabase
    .from("active_timer")
    .select("id, pausado_em, segundos_pausados")
    .maybeSingle();
  if (!timer?.pausado_em) return;

  const pausa = Math.round((Date.now() - new Date(timer.pausado_em).getTime()) / 1000);
  const { error } = await supabase
    .from("active_timer")
    .update({ pausado_em: null, segundos_pausados: timer.segundos_pausados + Math.max(0, pausa) })
    .eq("id", timer.id);
  if (error) return { erro: `Não foi possível retomar. (${error.code})` };
  revalidatePath("/", "layout");
}

/** Soma 1 distração. As actions de um mesmo aparelho rodam em sequência, então ler e somar é seguro. */
export async function registrarDistracao(): Promise<Resultado> {
  await getUsuario();
  const supabase = await createClient();
  const { data: timer } = await supabase.from("active_timer").select("id, distracoes").maybeSingle();
  if (!timer) return { erro: "O timer não está mais ativo." };
  const { error } = await supabase
    .from("active_timer")
    .update({ distracoes: timer.distracoes + 1 })
    .eq("id", timer.id);
  if (error) return { erro: `Não foi possível registrar a distração. (${error.code})` };
  revalidatePath("/", "layout");
}

/** Congela o tempo (pausa) e abre o formulário da sessão com a duração preenchida. */
export async function encerrarTimer(): Promise<Resultado> {
  await getUsuario();
  const supabase = await createClient();
  await supabase.from("active_timer").update({ pausado_em: new Date().toISOString() }).is("pausado_em", null);
  revalidatePath("/", "layout");
  redirect("/registrar?timer=1");
}

export async function descartarTimer(): Promise<Resultado> {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("active_timer").delete().not("id", "is", null);
  if (error) return { erro: `Não foi possível descartar. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/registrar");
}
