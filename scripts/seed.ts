/**
 * Seed do Echo: cria áreas, habilidades, níveis, metas periódicas, métricas e hábitos
 * iniciais para o usuário de ALLOWED_EMAIL (criando o usuário se ainda não existir).
 *
 *   npm run seed            → só roda se o usuário ainda não tiver nenhuma área
 *   npm run seed -- --reset → APAGA todos os dados do usuário e recria o seed
 *
 * Usa a chave secreta (service role), que ignora RLS — por isso roda só localmente.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();

if (!url || !secretKey || !email) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY e ALLOWED_EMAIL no .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const reset = process.argv.includes("--reset");

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

type Nivel = { nome: string; horas: number; fonte: string };

const CEFR_FONTE = "Cambridge English – Guided Learning Hours (estimativa)";
const NIVEIS_CEFR: Nivel[] = [
  { nome: "A1", horas: 100, fonte: CEFR_FONTE },
  { nome: "A2", horas: 200, fonte: CEFR_FONTE },
  { nome: "B1", horas: 400, fonte: CEFR_FONTE },
  { nome: "B2", horas: 600, fonte: CEFR_FONTE },
  { nome: "C1", horas: 800, fonte: CEFR_FONTE },
  { nome: "C2", horas: 1200, fonte: CEFR_FONTE },
];

const NIVEIS_GERAIS: Nivel[] = [
  { nome: "Iniciante funcional", horas: 20, fonte: "Ideia das “primeiras 20 horas” (Josh Kaufman)" },
  { nome: "Intermediário", horas: 100, fonte: "Heurística" },
  { nome: "Avançado", horas: 500, fonte: "Heurística" },
  { nome: "Expert", horas: 1500, fonte: "Heurística" },
  {
    nome: "Maestria",
    horas: 5000,
    fonte: "Heurística, inspirada nos estudos de prática deliberada (Ericsson)",
  },
];

type SkillSeed = {
  nome: string;
  niveis?: Nivel[];
  periodica?: { horas: number; periodo: "semana" | "mes" };
  destaque_dashboard?: boolean;
};

type MetricSeed = {
  nome: string;
  unidade: string;
  direcao: "maior_melhor" | "menor_melhor";
};

type AreaSeed = {
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  skills: SkillSeed[];
  metrics: MetricSeed[];
};

const AREAS: AreaSeed[] = [
  {
    nome: "Carreira",
    descricao: "Gestão de Tráfego",
    cor: "#3b82f6",
    icone: "briefcase",
    skills: [
      { nome: "Google Ads avançado", niveis: NIVEIS_GERAIS },
      { nome: "Meta Ads avançado", niveis: NIVEIS_GERAIS },
      { nome: "Tracking e mensuração (GTM, server-side)", niveis: NIVEIS_GERAIS },
      { nome: "Liderança de equipe", niveis: NIVEIS_GERAIS },
    ],
    metrics: [],
  },
  {
    nome: "Negócios",
    descricao: "Delfim",
    cor: "#10b981",
    icone: "trending-up",
    skills: [
      { nome: "Prospecção e vendas", niveis: NIVEIS_GERAIS },
      { nome: "Gestão do negócio", niveis: NIVEIS_GERAIS },
    ],
    metrics: [
      { nome: "Faturamento mensal", unidade: "R$", direcao: "maior_melhor" },
      { nome: "Clientes ativos", unidade: "qtd", direcao: "maior_melhor" },
      { nome: "Propostas enviadas", unidade: "qtd", direcao: "maior_melhor" },
    ],
  },
  {
    nome: "Estudos",
    descricao: "Faculdade e estudos formais",
    cor: "#8b5cf6",
    icone: "graduation-cap",
    skills: [{ nome: "Faculdade", periodica: { horas: 8, periodo: "semana" } }],
    metrics: [],
  },
  {
    nome: "Idiomas",
    descricao: "Línguas estrangeiras",
    cor: "#f59e0b",
    icone: "languages",
    skills: [
      { nome: "Inglês", niveis: NIVEIS_CEFR },
      { nome: "Espanhol", niveis: NIVEIS_CEFR },
    ],
    metrics: [],
  },
  {
    nome: "Físico",
    descricao: "Corpo e esporte",
    cor: "#ef4444",
    icone: "dumbbell",
    skills: [
      { nome: "Academia", periodica: { horas: 4, periodo: "semana" } },
      { nome: "Padel", niveis: NIVEIS_GERAIS, destaque_dashboard: true },
    ],
    metrics: [
      { nome: "Peso", unidade: "kg", direcao: "menor_melhor" },
      { nome: "% de gordura", unidade: "%", direcao: "menor_melhor" },
    ],
  },
  {
    nome: "Mente e Hábitos",
    descricao: "Rotina, foco e bem-estar",
    cor: "#14b8a6",
    icone: "brain",
    skills: [],
    metrics: [],
  },
];

const HABITOS: { nome: string; area: string }[] = [
  { nome: "Meditar", area: "Mente e Hábitos" },
  { nome: "Ler", area: "Mente e Hábitos" },
  { nome: "Acordar até 6h", area: "Mente e Hábitos" },
  { nome: "Dia sem vídeos curtos / streaming", area: "Mente e Hábitos" },
  { nome: "Treinar", area: "Físico" },
];

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

function check<T>(result: { data: T; error: unknown }, etapa: string): NonNullable<T> {
  if (result.error) {
    console.error(`Erro em "${etapa}":`, result.error);
    process.exit(1);
  }
  // Sem erro, .single() sempre traz a linha; nos demais casos o retorno não é usado.
  return result.data as NonNullable<T>;
}

async function encontrarOuCriarUsuario(): Promise<string> {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user) return user.id;
    if (data.users.length < 200) break;
  }

  console.log(`Usuário ${email} não existe; criando…`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const userId = await encontrarOuCriarUsuario();

  const { count } = await supabase
    .from("areas")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && !reset) {
    console.log(
      `O usuário já tem ${count} área(s). Nada foi feito. Use "npm run seed -- --reset" para apagar tudo e recriar.`,
    );
    return;
  }

  if (reset) {
    console.log("Apagando dados existentes…");
    // Áreas apagam em cascata habilidades, níveis, sessões, metas, métricas e marcos.
    for (const tabela of ["active_timer", "areas", "habits", "reviews"]) {
      check(await supabase.from(tabela).delete().eq("user_id", userId), `apagar ${tabela}`);
    }
  }

  // Garante os fatores de qualidade (o trigger cria para usuários novos).
  check(
    await supabase.rpc("criar_fatores_padrao", { p_user_id: userId }),
    "fatores de qualidade",
  );

  const areaIds = new Map<string, string>();

  for (const [i, area] of AREAS.entries()) {
    const { id: areaId } = check(
      await supabase
        .from("areas")
        .insert({
          user_id: userId,
          nome: area.nome,
          descricao: area.descricao,
          cor: area.cor,
          icone: area.icone,
          ordem: i,
        })
        .select("id")
        .single(),
      `área ${area.nome}`,
    );
    areaIds.set(area.nome, areaId);

    for (const [j, skill] of area.skills.entries()) {
      const tipo = skill.niveis ? "niveis" : skill.periodica ? "periodica" : "nenhuma";
      const { id: skillId } = check(
        await supabase
          .from("skills")
          .insert({
            user_id: userId,
            area_id: areaId,
            nome: skill.nome,
            tipo_meta_tempo: tipo,
            destaque_dashboard: skill.destaque_dashboard ?? false,
            ordem: j,
          })
          .select("id")
          .single(),
        `habilidade ${skill.nome}`,
      );

      if (skill.niveis) {
        check(
          await supabase.from("skill_levels").insert(
            skill.niveis.map((n, k) => ({
              user_id: userId,
              skill_id: skillId,
              nome_nivel: n.nome,
              horas_acumuladas_alvo: n.horas,
              fonte_referencia: n.fonte,
              ordem: k,
            })),
          ),
          `níveis de ${skill.nome}`,
        );
      }

      if (skill.periodica) {
        check(
          await supabase.from("periodic_targets").insert({
            user_id: userId,
            skill_id: skillId,
            horas_alvo: skill.periodica.horas,
            periodo: skill.periodica.periodo,
          }),
          `meta periódica de ${skill.nome}`,
        );
      }
    }

    if (area.metrics.length) {
      check(
        await supabase.from("metrics").insert(
          area.metrics.map((m, k) => ({
            user_id: userId,
            area_id: areaId,
            nome: m.nome,
            unidade: m.unidade,
            direcao: m.direcao,
            ordem: k,
          })),
        ),
        `métricas de ${area.nome}`,
      );
    }
  }

  check(
    await supabase.from("habits").insert(
      HABITOS.map((h, i) => ({
        user_id: userId,
        area_id: areaIds.get(h.area) ?? null,
        nome: h.nome,
        frequencia: "diario",
        ordem: i,
      })),
    ),
    "hábitos",
  );

  const totalSkills = AREAS.reduce((n, a) => n + a.skills.length, 0);
  const totalMetrics = AREAS.reduce((n, a) => n + a.metrics.length, 0);
  console.log(
    `Seed concluído para ${email}: ${AREAS.length} áreas, ${totalSkills} habilidades, ${totalMetrics} métricas, ${HABITOS.length} hábitos.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
