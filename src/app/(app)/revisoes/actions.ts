"use server";

import { revalidatePath } from "next/cache";
import { getUsuario } from "@/lib/auth";
import { hojeSP, inicioSemana, mesDe } from "@/lib/datas";
import { DIA_VALIDO, texto, textoOuNulo } from "@/lib/form";
import { periodoMes, periodoSemana } from "@/lib/revisoes";
import { createClient } from "@/lib/supabase/server";

export type EstadoRevisao = { ok: boolean; mensagem: string } | null;

/** Cria ou atualiza a revisão de um período (uma por tipo + início). */
export async function salvarRevisao(_anterior: EstadoRevisao, dados: FormData): Promise<EstadoRevisao> {
  const usuario = await getUsuario();
  const supabase = await createClient();

  const tipo = texto(dados, "tipo") === "mensal" ? "mensal" : "semanal";
  const inicio = texto(dados, "periodo_inicio");
  const notaTexto = texto(dados, "nota_geral");
  const nota = notaTexto ? Number(notaTexto) : null;

  if (!DIA_VALIDO.test(inicio) || inicio > hojeSP()) return { ok: false, mensagem: "Período inválido." };
  const periodo =
    tipo === "semanal"
      ? inicio === inicioSemana(inicio)
        ? periodoSemana(inicio)
        : null
      : inicio.endsWith("-01")
        ? periodoMes(mesDe(inicio))
        : null;
  if (!periodo) return { ok: false, mensagem: "Período inválido." };
  if (nota !== null && !(Number.isInteger(nota) && nota >= 1 && nota <= 5))
    return { ok: false, mensagem: "A nota geral vai de 1 a 5." };

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: usuario.id,
      tipo,
      periodo_inicio: periodo.desde,
      periodo_fim: periodo.ate,
      o_que_funcionou: textoOuNulo(dados, "o_que_funcionou"),
      onde_travei: textoOuNulo(dados, "onde_travei"),
      prioridades_proximo_periodo: textoOuNulo(dados, "prioridades_proximo_periodo"),
      nota_geral: nota,
    },
    { onConflict: "user_id,tipo,periodo_inicio" },
  );
  if (error) return { ok: false, mensagem: `Não foi possível salvar. (${error.code})` };

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Revisão salva." };
}

