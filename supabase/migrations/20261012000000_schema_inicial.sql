-- Echo — schema inicial
-- Convenções:
--   * Todas as tabelas têm user_id (default auth.uid()) e RLS "user_id = auth.uid()".
--     Tabelas filhas (ex.: skill_levels) também guardam user_id, para que a política
--     seja sempre a mesma e simples, sem joins.
--   * Enums são text + check, para facilitar mudanças futuras.
--   * Datas "do dia" (date) são calculadas no fuso America/Sao_Paulo.

-- ---------------------------------------------------------------------------
-- Hierarquia: Áreas → Habilidades → Metas
-- ---------------------------------------------------------------------------

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null,
  descricao text,
  cor text not null default '#0ea5e9',
  icone text,
  ordem int not null default 0,
  arquivada boolean not null default false,
  criado_em timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  nome text not null,
  descricao text,
  tipo_meta_tempo text not null default 'nenhuma'
    check (tipo_meta_tempo in ('niveis', 'periodica', 'nenhuma')),
  nivel_atual_autoavaliado smallint check (nivel_atual_autoavaliado between 1 and 10),
  -- Horas já acumuladas antes de usar o Echo (ponto de partida do progresso).
  horas_iniciais numeric(8, 2) not null default 0 check (horas_iniciais >= 0),
  -- Mostrar as horas da semana desta habilidade no dashboard (ex.: Padel).
  destaque_dashboard boolean not null default false,
  ordem int not null default 0,
  arquivada boolean not null default false,
  criado_em timestamptz not null default now()
);

create table public.skill_levels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  nome_nivel text not null,
  horas_acumuladas_alvo numeric(8, 2) not null check (horas_acumuladas_alvo > 0),
  ordem int not null default 0,
  fonte_referencia text
);

create table public.periodic_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  horas_alvo numeric(6, 2) not null check (horas_alvo > 0),
  periodo text not null check (periodo in ('semana', 'mes')),
  unique (skill_id, periodo)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  skill_id uuid references public.skills (id) on delete set null,
  titulo text not null,
  criterio_de_conclusao text,
  prazo date,
  status text not null default 'ativa' check (status in ('ativa', 'concluida', 'abandonada')),
  concluida_em timestamptz,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Registro de prática
-- ---------------------------------------------------------------------------

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  duracao_minutos int not null check (duracao_minutos > 0),
  nota_qualidade smallint not null check (nota_qualidade between 1 and 5),
  foco_especifico text,
  aprendizado text,
  erros text,
  proximo_passo text,
  teve_feedback boolean not null default false,
  criado_em timestamptz not null default now(),
  check (fim >= inicio)
);

-- Um timer por usuário; fica no banco para sobreviver a recarregar a página
-- e funcionar entre dispositivos.
create table public.active_timer (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  iniciado_em timestamptz not null default now()
);

-- Fatores de qualidade (editáveis em Configurações).
create table public.quality_factors (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nota smallint not null check (nota between 1 and 5),
  fator numeric(3, 2) not null check (fator >= 0 and fator <= 1),
  descricao text,
  primary key (user_id, nota)
);

-- ---------------------------------------------------------------------------
-- Evolução
-- ---------------------------------------------------------------------------

create table public.skill_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  nivel smallint not null check (nivel between 1 and 10),
  observacao text
);

create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  nome text not null,
  unidade text,
  direcao text not null default 'maior_melhor' check (direcao in ('maior_melhor', 'menor_melhor')),
  meta_valor numeric,
  ordem int not null default 0,
  arquivada boolean not null default false
);

create table public.metric_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  metric_id uuid not null references public.metrics (id) on delete cascade,
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  valor numeric not null,
  observacao text
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid not null references public.areas (id) on delete cascade,
  skill_id uuid references public.skills (id) on delete set null,
  titulo text not null,
  descricao text,
  data date not null default (now() at time zone 'America/Sao_Paulo')::date
);

-- ---------------------------------------------------------------------------
-- Hábitos
-- ---------------------------------------------------------------------------

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  area_id uuid references public.areas (id) on delete set null,
  nome text not null,
  -- 'diario' ou 'dias_semana' (usa dias_semana: 1 = segunda … 7 = domingo, ISO).
  frequencia text not null default 'diario' check (frequencia in ('diario', 'dias_semana')),
  dias_semana smallint[] check (dias_semana <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  ativo boolean not null default true,
  ordem int not null default 0,
  check (frequencia = 'diario' or cardinality(dias_semana) > 0)
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  data date not null,
  concluido boolean not null default true,
  unique (habit_id, data)
);

-- ---------------------------------------------------------------------------
-- Revisões
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('semanal', 'mensal')),
  periodo_inicio date not null,
  periodo_fim date not null,
  o_que_funcionou text,
  onde_travei text,
  prioridades_proximo_periodo text,
  nota_geral smallint check (nota_geral between 1 and 5),
  criado_em timestamptz not null default now(),
  unique (user_id, tipo, periodo_inicio),
  check (periodo_fim >= periodo_inicio)
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index on public.areas (user_id, ordem);
create index on public.skills (area_id);
create index on public.skill_levels (skill_id, ordem);
create index on public.goals (user_id, status, prazo);
create index on public.practice_sessions (user_id, inicio desc);
create index on public.practice_sessions (skill_id, inicio desc);
create index on public.skill_assessments (skill_id, data desc);
create index on public.metric_entries (metric_id, data);
create index on public.milestones (user_id, data desc);
create index on public.habit_logs (user_id, data);
create index on public.reviews (user_id, tipo, periodo_inicio desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: cada linha pertence a user_id = auth.uid()
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'areas', 'skills', 'skill_levels', 'periodic_targets', 'goals',
    'practice_sessions', 'active_timer', 'quality_factors',
    'skill_assessments', 'metrics', 'metric_entries', 'milestones',
    'habits', 'habit_logs', 'reviews'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "dono" on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))',
      t
    );
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Sessões com horas brutas e efetivas (horas efetivas = duração × fator)
-- security_invoker: a view respeita o RLS de quem consulta.
-- ---------------------------------------------------------------------------

create view public.practice_sessions_horas
with (security_invoker = true) as
select
  s.*,
  (s.inicio at time zone 'America/Sao_Paulo')::date as data_local,
  round(s.duracao_minutos / 60.0, 4) as horas_brutas,
  round(s.duracao_minutos / 60.0 * coalesce(q.fator, 1), 4) as horas_efetivas
from public.practice_sessions s
left join public.quality_factors q
  on q.user_id = s.user_id and q.nota = s.nota_qualidade;

-- ---------------------------------------------------------------------------
-- Fatores de qualidade padrão para todo novo usuário
-- ---------------------------------------------------------------------------

create function public.criar_fatores_padrao(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.quality_factors (user_id, nota, fator, descricao) values
    (p_user_id, 5, 1.00, 'Foco total, no limite da habilidade, com feedback'),
    (p_user_id, 4, 0.85, 'Boa concentração, desafiador'),
    (p_user_id, 3, 0.70, 'Ok, mas com distrações ou no automático'),
    (p_user_id, 2, 0.50, 'Muito disperso, pouco desafio'),
    (p_user_id, 1, 0.30, 'Quase só presença')
  on conflict (user_id, nota) do nothing;
$$;

revoke execute on function public.criar_fatores_padrao(uuid) from public, anon, authenticated;

create function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.criar_fatores_padrao(new.id);
  return new;
end;
$$;

create trigger ao_criar_usuario
after insert on auth.users
for each row execute function public.ao_criar_usuario();

-- Usuários que já existiam antes desta migration.
select public.criar_fatores_padrao(id) from auth.users;
