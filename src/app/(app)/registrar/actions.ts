"use server";

import { revalidatePath } from "next/cache";
import { getUsuario } from "@/lib/auth";
import { deInputLocal } from "@/lib/datas";
import { numero, texto, textoOuNulo } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

export type EstadoSessao =
  | { ok: false; erro: string }
  | { ok: true; skillId: string; habilidade: string; minutos: number; horasEfetivas: number }
  | null;

const MAX_MINUTOS = 24 * 60;
const erro = (mensagem: string): EstadoSessao => ({ ok: false, erro: mensagem });

export async function salvarSessao(_anterior: EstadoSessao, dados: FormData): Promise<EstadoSessao> {
  await getUsuario();
  const supabase = await createClient();

  const skillId = texto(dados, "skill_id");
  const nota = Number(texto(dados, "nota_qualidade"));
  const tipoPratica = texto(dados, "tipo_pratica") === "passiva" ? "passiva" : "ativa";
  const distracoes = Math.max(0, Math.trunc(numero(dados, "distracoes")) || 0);
  const timerId = texto(dados, "timer_id");

  if (!ehUuid(skillId)) return erro("Escolha a habilidade.");
  if (!(Number.isInteger(nota) && nota >= 1 && nota <= 5)) return erro("Dê uma nota de qualidade de 1 a 5.");

  // Duração: "duracao" (termina agora, ou no fim do timer) ou "intervalo" (início e fim).
  let inicio: Date;
  let fim: Date;
  let minutos: number;

  if (texto(dados, "modo") === "intervalo") {
    const i = deInputLocal(texto(dados, "inicio"));
    const f = deInputLocal(texto(dados, "fim"));
    if (!i || !f) return erro("Informe início e fim.");
    if (f <= i) return erro("O fim precisa ser depois do início.");
    if (f.getTime() > Date.now() + 5 * 60_000) return erro("O fim não pode estar no futuro.");
    inicio = i;
    fim = f;
    minutos = Math.round((f.getTime() - i.getTime()) / 60_000);
  } else {
    minutos = Math.round(numero(dados, "duracao"));
    if (!(minutos > 0)) return erro("Informe a duração em minutos.");
    // Vindo do timer: início e fim reais (o fim pode distar mais que a duração, por causa das pausas).
    const timerInicio = texto(dados, "timer_inicio");
    const timerFim = texto(dados, "timer_fim");
    fim = timerFim ? new Date(timerFim) : new Date();
    inicio = timerInicio ? new Date(timerInicio) : new Date(fim.getTime() - minutos * 60_000);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim < inicio)
      return erro("Horários do timer inválidos.");
  }
  if (minutos < 1) return erro("A sessão precisa ter pelo menos 1 minuto.");
  if (minutos > MAX_MINUTOS) return erro("Uma sessão pode ter no máximo 24 horas.");

  const { data: skill } = await supabase.from("skills").select("nome").eq("id", skillId).maybeSingle();
  if (!skill) return erro("Habilidade não encontrada.");

  const { data: sessao, error } = await supabase
    .from("practice_sessions")
    .insert({
      skill_id: skillId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      duracao_minutos: minutos,
      nota_qualidade: nota,
      tipo_pratica: tipoPratica,
      distracoes,
      foco_especifico: textoOuNulo(dados, "foco_especifico"),
      aprendizado: textoOuNulo(dados, "aprendizado"),
      erros: textoOuNulo(dados, "erros"),
      proximo_passo: textoOuNulo(dados, "proximo_passo"),
      teve_feedback: dados.get("teve_feedback") === "on",
    })
    .select("id")
    .single();
  if (error) return erro(`Não foi possível salvar a sessão. (${error.code})`);

  if (ehUuid(timerId)) await supabase.from("active_timer").delete().eq("id", timerId);

  const { data: horas } = await supabase
    .from("practice_sessions_horas")
    .select("horas_efetivas")
    .eq("id", sessao.id)
    .single();

  revalidatePath("/", "layout");
  return {
    ok: true,
    skillId,
    habilidade: skill.nome,
    minutos,
    horasEfetivas: Number(horas?.horas_efetivas ?? 0),
  };
}

export async function excluirSessao(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("practice_sessions").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
}
