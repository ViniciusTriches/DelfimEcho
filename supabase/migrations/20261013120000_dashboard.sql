-- Echo — Fase 7: dashboard
--   * metrics.no_dashboard: métricas com atalho de registro rápido no dashboard (Peso já ligado).
--   * user_settings.dias_alerta_abandono: habilidade sem sessão há N dias vira alerta.
--   * weekly_plans: horas planejadas por área para cada semana (segunda-feira).

alter table public.metrics
  add column no_dashboard boolean not null default false;

update public.metrics set no_dashboard = true where nome = 'Peso';

alter table public.user_settings
  add column dias_alerta_abandono int not null default 10
    check (dias_alerta_abandono between 1 and 365);

create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  semana date not null check (extract(isodow from semana) = 1), -- sempre uma segunda-feira
  area_id uuid not null references public.areas (id) on delete cascade,
  horas numeric(5, 2) not null check (horas >= 0 and horas <= 168),
  unique (user_id, semana, area_id)
);

create index on public.weekly_plans (user_id, semana desc);

alter table public.weekly_plans enable row level security;
create policy "dono" on public.weekly_plans for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.weekly_plans to authenticated;
