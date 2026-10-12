"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/auth";
import { hojeSP } from "@/lib/datas";
import { DIA_VALIDO, destinoSeguro, numero, texto, textoOuNulo } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { ehUuid } from "@/lib/uuid";

export type EstadoForm = { erro: string } | null;

export async function salvarMetrica(_anterior: EstadoForm, dados: FormData): Promise<EstadoForm> {
  await getUsuario();
  const supabase = await createClient();

  const id = texto(dados, "id");
  const nome = texto(dados, "nome");
  const areaId = texto(dados, "area_id");
  const direcao = texto(dados, "direcao") === "menor_melhor" ? "menor_melhor" : "maior_melhor";
  const meta = numero(dados, "meta_valor");

  if (!nome) return { erro: "Dê um nome para a métrica." };
  if (!ehUuid(areaId)) return { erro: "Escolha a área." };
  if (texto(dados, "meta_valor") && Number.isNaN(meta)) return { erro: "Meta inválida." };

  const campos = {
    nome,
    area_id: areaId,
    unidade: textoOuNulo(dados, "unidade"),
    direcao,
    meta_valor: Number.isNaN(meta) ? null : meta,
  };

  let metricaId = id;
  if (id) {
    const { error } = await supabase.from("metrics").update(campos).eq("id", id);
    if (error) return { erro: `Não foi possível salvar. (${error.code})` };
  } else {
    const { data: ultima } = await supabase
      .from("metrics")
      .select("ordem")
      .eq("area_id", areaId)
      .order("ordem", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("metrics")
      .insert({ ...campos, ordem: (ultima?.ordem ?? -1) + 1 })
      .select("id")
      .single();
    if (error) return { erro: `Não foi possível criar. (${error.code})` };
    metricaId = data.id;
  }

  revalidatePath("/", "layout");
  redirect(destinoSeguro(texto(dados, "voltar"), `/metricas/${metricaId}`));
}

export type EstadoValor = { ok: boolean; mensagem: string } | null;

/** Registra um valor (o formulário rápido usa hoje como data padrão). */
export async function registrarValor(_anterior: EstadoValor, dados: FormData): Promise<EstadoValor> {
  await getUsuario();
  const supabase = await createClient();

  const metricId = texto(dados, "metric_id");
  const valor = numero(dados, "valor");
  const data = texto(dados, "data") || hojeSP();

  if (!ehUuid(metricId)) return { ok: false, mensagem: "Métrica inválida." };
  if (Number.isNaN(valor)) return { ok: false, mensagem: "Informe um número." };
  if (!DIA_VALIDO.test(data) || data > hojeSP()) return { ok: false, mensagem: "Data inválida." };

  const { error } = await supabase
    .from("metric_entries")
    .insert({ metric_id: metricId, valor, data, observacao: textoOuNulo(dados, "observacao") });
  if (error) return { ok: false, mensagem: `Não foi possível registrar. (${error.code})` };

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Registrado." };
}

export async function excluirValor(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("metric_entries").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function arquivarMetrica(id: string, arquivada: boolean) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("metrics").update({ arquivada }).eq("id", id);
  if (error) return { erro: `Não foi possível ${arquivada ? "arquivar" : "restaurar"}. (${error.code})` };
  revalidatePath("/", "layout");
}

export async function excluirMetrica(id: string) {
  await getUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("metrics").delete().eq("id", id);
  if (error) return { erro: `Não foi possível excluir. (${error.code})` };
  revalidatePath("/", "layout");
  redirect("/metricas");
}
