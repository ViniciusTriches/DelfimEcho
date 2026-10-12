-- Echo — Fase 3: registro de prática
--   * Sessões: contagem de distrações e tipo de prática (ativa/passiva).
--   * Habilidades: se a prática passiva faz sentido (ligado nas de Idiomas).
--   * Timer: foco da sessão, distrações e pausa (para o modo foco).
--   * user_settings: fator extra da prática passiva (editável em Configurações).
--   * View de horas efetivas passa a aplicar o fator da prática passiva.

alter table public.practice_sessions
  add column distracoes int not null default 0 check (distracoes >= 0),
  add column tipo_pratica text not null default 'ativa' check (tipo_pratica in ('ativa', 'passiva'));

alter table public.skills
  add column permite_pratica_passiva boolean not null default false;

update public.skills s
set permite_pratica_passiva = true
from public.areas a
where a.id = s.area_id and a.nome = 'Idiomas';

alter table public.active_timer
  add column foco_especifico text,
  add column distracoes int not null default 0 check (distracoes >= 0),
  -- Pausa: enquanto pausado_em não é nulo, o tempo não corre.
  add column pausado_em timestamptz,
  add column segundos_pausados int not null default 0 check (segundos_pausados >= 0);

-- ---------------------------------------------------------------------------
-- Configurações do usuário (uma linha por usuário)
-- ---------------------------------------------------------------------------

create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  fator_pratica_passiva numeric(3, 2) not null default 0.50
    check (fator_pratica_passiva >= 0 and fator_pratica_passiva <= 1)
);

alter table public.user_settings enable row level security;
create policy "dono" on public.user_settings for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update, delete on public.user_settings to authenticated;

insert into public.user_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Novos usuários já ganham fatores de qualidade e configurações.
create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.criar_fatores_padrao(new.id);
  insert into public.user_settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- View de horas: horas efetivas = duração × fator da nota × fator passivo
-- (recriada porque ganhou colunas novas no meio de s.*)
-- ---------------------------------------------------------------------------

drop view public.practice_sessions_horas;

create view public.practice_sessions_horas
with (security_invoker = true) as
select
  s.*,
  (s.inicio at time zone 'America/Sao_Paulo')::date as data_local,
  round(s.duracao_minutos / 60.0, 4) as horas_brutas,
  round(
    s.duracao_minutos / 60.0
      * coalesce(q.fator, 1)
      * case when s.tipo_pratica = 'passiva' then coalesce(c.fator_pratica_passiva, 0.5) else 1 end,
    4
  ) as horas_efetivas
from public.practice_sessions s
left join public.quality_factors q
  on q.user_id = s.user_id and q.nota = s.nota_qualidade
left join public.user_settings c
  on c.user_id = s.user_id;

grant select on public.practice_sessions_horas to authenticated;
