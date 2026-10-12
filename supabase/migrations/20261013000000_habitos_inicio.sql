-- Echo — Fase 5: hábitos
-- Data a partir da qual o hábito é acompanhado. Dias anteriores não contam como
-- falha na taxa de cumprimento nem quebram sequências. Hábitos existentes começam hoje.

alter table public.habits
  add column inicio date not null default (now() at time zone 'America/Sao_Paulo')::date;
