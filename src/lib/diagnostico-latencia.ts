// TEMPORÁRIO: mede o tempo das consultas de Início, Hábitos e Áreas no padrão
// "antes" (ondas sequenciais) e "depois" (uma onda em paralelo). Usa a chave pública
// sem sessão: o RLS devolve zero linhas, mas o tempo de rede é o mesmo. Só números.
import { createClient } from "@supabase/supabase-js";

const agora = () => performance.now();

export async function medirLatencia(url: string, chave: string) {
  const db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
  const q = {
    areas: () => db.from("areas").select("id, nome, cor, icone").limit(50),
    skills: () => db.from("skills").select("id, nome, area_id").limit(200),
    sessoes: () => db.from("practice_sessions_horas").select("data_local, skill_id, horas_efetivas").limit(1000),
    config: () => db.from("user_settings").select("dias_alerta_abandono").maybeSingle(),
    plano: () => db.from("weekly_plans").select("area_id, horas").limit(50),
    metas: () => db.from("goals").select("id, titulo, prazo").limit(50),
    timer: () => db.from("active_timer").select("iniciado_em").maybeSingle(),
    habitos: () => db.from("habits").select("id, inicio").limit(50),
    logs: () => db.from("habit_logs").select("habit_id, data").limit(1000),
    metricas: () => db.from("metrics").select("id, nome").limit(50),
    valores: () => db.from("metric_entries").select("metric_id, data, valor").limit(1000),
    revisoes: () => db.from("reviews").select("tipo, periodo_inicio").limit(20),
  };

  async function tempo(fn: () => PromiseLike<unknown>) {
    const t = agora();
    await fn();
    return Math.round(agora() - t);
  }
  const onda = (...fns: (() => PromiseLike<unknown>)[]) => () => Promise.all(fns.map((f) => f()));

  // Aquece a conexão (DNS/TLS) para não medir o primeiro aperto de mão.
  await q.areas();

  const rtts: number[] = [];
  for (let i = 0; i < 5; i++) rtts.push(await tempo(() => q.areas()));
  rtts.sort((a, b) => a - b);

  const cenarios = {
    // Início antes: 1ª onda (9 consultas) → 2ª onda (logs dos hábitos e valores das métricas dependem da 1ª).
    inicioAntes: async () => {
      await onda(q.areas, q.skills, q.sessoes, q.config, q.plano, q.metas, q.timer, q.habitos, q.metricas, q.revisoes)();
      await onda(q.logs, q.valores)();
    },
    inicioDepois: onda(q.areas, q.skills, q.sessoes, q.config, q.plano, q.metas, q.timer, q.habitos, q.logs, q.metricas, q.valores, q.revisoes),
    habitosAntes: async () => {
      await q.habitos();
      await q.logs();
    },
    habitosDepois: onda(q.habitos, q.logs),
    areas: onda(q.areas, q.skills),
  };

  const resultado: Record<string, number> = { rttMediano: rtts[2] };
  for (const [nome, fn] of Object.entries(cenarios)) {
    const medidas: number[] = [];
    for (let i = 0; i < 3; i++) medidas.push(await tempo(fn));
    medidas.sort((a, b) => a - b);
    resultado[nome] = medidas[1]; // mediana de 3
  }
  return resultado;
}
