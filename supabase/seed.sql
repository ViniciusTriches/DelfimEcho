-- Echo — dados iniciais
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique em Run.
-- Antes, troque o e-mail na linha marcada abaixo pelo seu (o mesmo de ALLOWED_EMAIL).
-- O usuário precisa existir em Authentication → Users.
--
-- É idempotente: rodar de novo só cria o que estiver faltando (compara pelo nome),
-- sem duplicar nada. Atenção: se você renomear uma área/habilidade/métrica/hábito
-- pela interface e rodar o seed de novo, o nome original será recriado.

do $$
declare
  -- >>> TROQUE PELO SEU E-MAIL <<<
  v_email text := 'seu-email@exemplo.com';

  v_user_id uuid;

  v_cefr jsonb := '[
    {"nome": "A1", "horas": 100},
    {"nome": "A2", "horas": 200},
    {"nome": "B1", "horas": 400},
    {"nome": "B2", "horas": 600},
    {"nome": "C1", "horas": 800},
    {"nome": "C2", "horas": 1200}
  ]';
  v_cefr_fonte text := 'Cambridge English – Guided Learning Hours (estimativa)';

  v_gerais jsonb := '[
    {"nome": "Iniciante funcional", "horas": 20,   "fonte": "Ideia das “primeiras 20 horas” (Josh Kaufman)"},
    {"nome": "Intermediário",       "horas": 100,  "fonte": "Heurística"},
    {"nome": "Avançado",            "horas": 500,  "fonte": "Heurística"},
    {"nome": "Expert",              "horas": 1500, "fonte": "Heurística"},
    {"nome": "Maestria",            "horas": 5000, "fonte": "Heurística, inspirada nos estudos de prática deliberada (Ericsson)"}
  ]';

  -- skills[].niveis: "cefr" | "gerais"; skills[].periodica: {"horas", "periodo"}
  v_areas jsonb := '[
    {
      "nome": "Carreira", "descricao": "Gestão de Tráfego", "cor": "#3b82f6", "icone": "briefcase",
      "skills": [
        {"nome": "Google Ads avançado", "niveis": "gerais"},
        {"nome": "Meta Ads avançado", "niveis": "gerais"},
        {"nome": "Tracking e mensuração (GTM, server-side)", "niveis": "gerais"},
        {"nome": "Liderança de equipe", "niveis": "gerais"}
      ],
      "metrics": []
    },
    {
      "nome": "Negócios", "descricao": "Delfim", "cor": "#10b981", "icone": "trending-up",
      "skills": [
        {"nome": "Prospecção e vendas", "niveis": "gerais"},
        {"nome": "Gestão do negócio", "niveis": "gerais"}
      ],
      "metrics": [
        {"nome": "Faturamento mensal", "unidade": "R$", "direcao": "maior_melhor"},
        {"nome": "Clientes ativos", "unidade": "qtd", "direcao": "maior_melhor"},
        {"nome": "Propostas enviadas", "unidade": "qtd", "direcao": "maior_melhor"}
      ]
    },
    {
      "nome": "Estudos", "descricao": "Faculdade e estudos formais", "cor": "#8b5cf6", "icone": "graduation-cap",
      "skills": [
        {"nome": "Faculdade", "periodica": {"horas": 8, "periodo": "semana"}}
      ],
      "metrics": []
    },
    {
      "nome": "Idiomas", "descricao": "Línguas estrangeiras", "cor": "#f59e0b", "icone": "languages",
      "skills": [
        {"nome": "Inglês", "niveis": "cefr"},
        {"nome": "Espanhol", "niveis": "cefr"}
      ],
      "metrics": []
    },
    {
      "nome": "Físico", "descricao": "Corpo e esporte", "cor": "#ef4444", "icone": "dumbbell",
      "skills": [
        {"nome": "Academia", "periodica": {"horas": 4, "periodo": "semana"}},
        {"nome": "Padel", "niveis": "gerais", "destaque_dashboard": true}
      ],
      "metrics": [
        {"nome": "Peso", "unidade": "kg", "direcao": "menor_melhor"},
        {"nome": "% de gordura", "unidade": "%", "direcao": "menor_melhor"}
      ]
    },
    {
      "nome": "Mente e Hábitos", "descricao": "Rotina, foco e bem-estar", "cor": "#14b8a6", "icone": "brain",
      "skills": [],
      "metrics": []
    }
  ]';

  v_habitos jsonb := '[
    {"nome": "Meditar", "area": "Mente e Hábitos"},
    {"nome": "Ler", "area": "Mente e Hábitos"},
    {"nome": "Acordar até 6h", "area": "Mente e Hábitos"},
    {"nome": "Dia sem vídeos curtos / streaming", "area": "Mente e Hábitos"},
    {"nome": "Treinar", "area": "Físico"}
  ]';

  r_area record;
  r_skill record;
  r_item record;
  v_area_id uuid;
  v_skill_id uuid;
  v_niveis jsonb;
begin
  select id into v_user_id from auth.users where lower(email) = lower(trim(v_email));
  if v_user_id is null then
    raise exception 'Usuário "%" não encontrado. Crie-o em Authentication → Users ou corrija o e-mail no topo do seed.', v_email;
  end if;

  -- Fatores de qualidade (a migration já cria; aqui só garante).
  perform public.criar_fatores_padrao(v_user_id);

  for r_area in
    select value as a, ordinality - 1 as ordem from jsonb_array_elements(v_areas) with ordinality
  loop
    select id into v_area_id from public.areas
    where user_id = v_user_id and nome = r_area.a->>'nome';

    if v_area_id is null then
      insert into public.areas (user_id, nome, descricao, cor, icone, ordem)
      values (v_user_id, r_area.a->>'nome', r_area.a->>'descricao', r_area.a->>'cor',
              r_area.a->>'icone', r_area.ordem)
      returning id into v_area_id;
    end if;

    -- Habilidades
    for r_skill in
      select value as s, ordinality - 1 as ordem from jsonb_array_elements(r_area.a->'skills') with ordinality
    loop
      select id into v_skill_id from public.skills
      where area_id = v_area_id and nome = r_skill.s->>'nome';

      if v_skill_id is null then
        insert into public.skills (user_id, area_id, nome, tipo_meta_tempo, destaque_dashboard, ordem)
        values (
          v_user_id, v_area_id, r_skill.s->>'nome',
          case
            when r_skill.s ? 'niveis' then 'niveis'
            when r_skill.s ? 'periodica' then 'periodica'
            else 'nenhuma'
          end,
          coalesce((r_skill.s->>'destaque_dashboard')::boolean, false),
          r_skill.ordem
        )
        returning id into v_skill_id;
      end if;

      -- Níveis
      v_niveis := case r_skill.s->>'niveis' when 'cefr' then v_cefr when 'gerais' then v_gerais end;
      if v_niveis is not null then
        insert into public.skill_levels (user_id, skill_id, nome_nivel, horas_acumuladas_alvo, fonte_referencia, ordem)
        select v_user_id, v_skill_id, n.value->>'nome', (n.value->>'horas')::numeric,
               coalesce(n.value->>'fonte', v_cefr_fonte), n.ordinality - 1
        from jsonb_array_elements(v_niveis) with ordinality as n
        where not exists (
          select 1 from public.skill_levels l
          where l.skill_id = v_skill_id and l.nome_nivel = n.value->>'nome'
        );
      end if;

      -- Meta periódica
      if r_skill.s ? 'periodica' then
        insert into public.periodic_targets (user_id, skill_id, horas_alvo, periodo)
        values (v_user_id, v_skill_id, (r_skill.s->'periodica'->>'horas')::numeric,
                r_skill.s->'periodica'->>'periodo')
        on conflict (skill_id, periodo) do nothing;
      end if;
    end loop;

    -- Métricas
    for r_item in
      select value as m, ordinality - 1 as ordem from jsonb_array_elements(r_area.a->'metrics') with ordinality
    loop
      insert into public.metrics (user_id, area_id, nome, unidade, direcao, ordem)
      select v_user_id, v_area_id, r_item.m->>'nome', r_item.m->>'unidade', r_item.m->>'direcao', r_item.ordem
      where not exists (
        select 1 from public.metrics where area_id = v_area_id and nome = r_item.m->>'nome'
      );
    end loop;
  end loop;

  -- Hábitos (diários)
  insert into public.habits (user_id, area_id, nome, frequencia, ordem)
  select v_user_id,
         (select id from public.areas where user_id = v_user_id and nome = h.value->>'area'),
         h.value->>'nome', 'diario', h.ordinality - 1
  from jsonb_array_elements(v_habitos) with ordinality as h
  where not exists (
    select 1 from public.habits where user_id = v_user_id and nome = h.value->>'nome'
  );

  raise notice 'Seed concluído para %: % áreas, % habilidades, % níveis, % metas periódicas, % métricas, % hábitos.',
    v_email,
    (select count(*) from public.areas where user_id = v_user_id),
    (select count(*) from public.skills where user_id = v_user_id),
    (select count(*) from public.skill_levels where user_id = v_user_id),
    (select count(*) from public.periodic_targets where user_id = v_user_id),
    (select count(*) from public.metrics where user_id = v_user_id),
    (select count(*) from public.habits where user_id = v_user_id);
end
$$;

-- Conferência (esperado na primeira vez: 6 áreas, 11 habilidades, 47 níveis,
-- 2 metas periódicas, 5 métricas, 5 hábitos, 5 fatores de qualidade).
select
  (select count(*) from public.areas) as areas,
  (select count(*) from public.skills) as habilidades,
  (select count(*) from public.skill_levels) as niveis,
  (select count(*) from public.periodic_targets) as metas_periodicas,
  (select count(*) from public.metrics) as metricas,
  (select count(*) from public.habits) as habitos,
  (select count(*) from public.quality_factors) as fatores_qualidade;
