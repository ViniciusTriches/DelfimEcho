-- Echo — Fase "Calendário de planejamento"
--   * planned_blocks: horários reservados para praticar uma habilidade. Um bloco pode
--     repetir toda semana (dias ISO 1 = seg … 7 = dom) até uma data opcional. As
--     ocorrências são geradas na leitura (nada de uma linha por ocorrência).
--     Exceções de série: datas_excluidas guarda ocorrências apagadas ou editadas
--     "só esta" (a versão editada vira um bloco avulso).
--   * user_settings: faixa de horário visível na grade (padrão 05:00 às 23:00).

create table public.planned_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  -- Primeira ocorrência (avulso: a única). Nas séries, o horário local de início e a
  -- duração valem para todas as ocorrências.
  inicio timestamptz not null,
  fim timestamptz not null,
  observacao text,
  repete_dias smallint[] check (
    repete_dias is null
    or (cardinality(repete_dias) between 1 and 7 and repete_dias <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[])
  ),
  repete_ate date,
  datas_excluidas date[] not null default '{}',
  criado_em timestamptz not null default now(),
  check (fim > inicio),
  check (fim - inicio <= interval '24 hours'),
  check (repete_ate is null or repete_dias is not null)
);

create index on public.planned_blocks (user_id, inicio);

alter table public.planned_blocks enable row level security;
create policy "dono" on public.planned_blocks for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.planned_blocks to authenticated;

alter table public.user_settings
  add column calendario_hora_inicio smallint not null default 5,
  add column calendario_hora_fim smallint not null default 23,
  add constraint calendario_faixa check (
    calendario_hora_inicio between 0 and 23
    and calendario_hora_fim between 1 and 24
    and calendario_hora_fim > calendario_hora_inicio
  );
