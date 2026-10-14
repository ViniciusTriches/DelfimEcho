import type { Metadata } from "next";
import { headers } from "next/headers";
import { diasDaGradeMes, type Visao } from "@/lib/calendario";
import { hojeSP, inicioSemana, mesDe, somarDias } from "@/lib/datas";
import { DIA_VALIDO } from "@/lib/form";
import { nivelCalor } from "@/lib/painel";
import { createClient } from "@/lib/supabase/server";
import { Calendario, type DiaMes } from "./calendario";
import { carregarCalendario, resumirSemana } from "./dados";

export const metadata: Metadata = { title: "Calendário" };

/** Celular? (dicas do navegador). Decide a visão padrão e o primeiro desenho da semana. */
async function ehCelular(): Promise<boolean> {
  const h = await headers();
  return h.get("sec-ch-ua-mobile") === "?1" || /Mobi|Android|iPhone|iPod/i.test(h.get("user-agent") ?? "");
}

export default async function CalendarioPage({ searchParams }: PageProps<"/calendario">) {
  const params = await searchParams;
  // Sessão (cookies) antes da hora atual: a página é dinâmica por requisição.
  await createClient();
  const hoje = hojeSP();
  const celular = await ehCelular();
  // Visão padrão quando a URL não diz: Dia no celular, Semana no PC.
  const visao: Visao =
    params.visao === "dia" || params.visao === "semana" || params.visao === "mes" ? params.visao : celular ? "dia" : "semana";
  const data = typeof params.data === "string" && DIA_VALIDO.test(params.data) ? params.data : hoje;

  // Dia e semana carregam a semana inteira (trocar de dia dentro dela não volta ao servidor).
  const semana = inicioSemana(data);
  const gradeMes = visao === "mes" ? diasDaGradeMes(mesDe(data)) : null;
  const de = gradeMes ? gradeMes[0] : semana;
  const ate = gradeMes ? gradeMes.at(-1)! : somarDias(semana, 6);

  const dados = await carregarCalendario(de, ate);

  let mes: DiaMes[] | null = null;
  if (gradeMes) {
    mes = gradeMes.map((dia) => {
      const horas = dados.sessoes.filter((s) => s.data === dia).reduce((t, s) => t + s.horasEfetivas, 0);
      return {
        dia,
        horas,
        nivel: nivelCalor(horas),
        blocos: dados.blocos.filter((b) => b.data === dia).length,
        metas: dados.diaInteiro.filter((d) => d.tipo === "meta" && d.data === dia).length,
        marcos: dados.diaInteiro.filter((d) => d.tipo === "marco" && d.data === dia).length,
      };
    });
  }

  return (
    <Calendario
      key={`${visao}:${visao === "mes" ? mesDe(data) : semana}`}
      visao={visao}
      celular={celular}
      data={data}
      hoje={hoje}
      blocos={dados.blocos}
      sessoes={dados.sessoes}
      habilidades={dados.habilidades}
      diaInteiro={dados.diaInteiro}
      faixa={dados.faixa}
      resumo={visao === "mes" ? null : resumirSemana(semana, dados)}
      mes={mes}
    />
  );
}
