# Prompt — Echo (Sistema de Progresso Pessoal)

> Cole este arquivo na raiz do projeto e diga ao Claude Code: "Leia o PROMPT-sistema-progresso.md e comece pela Fase 1."

---

## Contexto

Quero construir o **Echo**, um sistema web **de uso pessoal (só eu vou usar)** para acompanhar meu progresso em habilidades, negócios e áreas da minha vida.

O nome vem da ecolocalização do golfinho (o projeto faz parte da família da minha marca Delfim, junto com o Delfim Sonar): eu registro a prática e o sistema devolve onde estou evoluindo. Use "Echo" como nome do app na interface, no título das páginas, no manifest do PWA e no README. Nome do repositório/pasta: `echo`.

A filosofia central é a **prática deliberada**: progresso não vem só de horas, mas de **horas bem gastas**. Por isso o sistema registra tempo, qualidade da prática e evolução real (níveis, métricas, marcos), e não apenas um contador de horas.

Prioridades:
- **Simplicidade** acima de tudo. Nada de arquitetura complexa, microserviços ou abstrações desnecessárias.
- Uso principal no **PC**, mas preciso **registrar atividades pelo celular** rapidamente (layout responsivo + PWA).
- Interface toda em **português (pt-BR)**, fuso horário **America/Sao_Paulo**, semana começando na **segunda-feira**.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Supabase** (Postgres + Auth) — login por e-mail (magic link), apenas um usuário
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** para gráficos
- **PWA** (manifest + service worker simples) para instalar no celular
- Deploy na **Vercel**

Use Row Level Security em todas as tabelas filtrando por `user_id = auth.uid()`, mesmo sendo só um usuário.

## Estrutura de dados

### Hierarquia: Áreas → Habilidades → Metas

**areas**: id, user_id, nome, descrição, cor, ícone, ordem, arquivada

**skills** (habilidades): id, user_id, area_id, nome, descrição, tipo_meta_tempo (`niveis` | `periodica` | `nenhuma`), nivel_atual_autoavaliado (1–10), arquivada

**skill_levels** (metas de tempo por nível, para habilidades do tipo `niveis`): id, skill_id, nome_nivel (ex.: "A1", "Intermediário"), horas_acumuladas_alvo, ordem, fonte_referencia (texto, ex.: "Cambridge English – Guided Learning Hours")

**periodic_targets** (para habilidades do tipo `periodica`): id, skill_id, horas_alvo, periodo (`semana` | `mes`)

**goals** (metas de resultado, além das de tempo): id, user_id, area_id, skill_id (opcional), titulo, criterio_de_conclusao, prazo, status (`ativa` | `concluida` | `abandonada`), concluida_em

### Registro de prática

**practice_sessions**: id, user_id, skill_id, inicio, fim, duracao_minutos, nota_qualidade (1–5), foco_especifico (o que treinou), aprendizado, erros, proximo_passo, teve_feedback (bool)

**active_timer**: id, user_id, skill_id, iniciado_em — guardado no banco para o timer sobreviver a recarregar a página e funcionar entre PC e celular (iniciar no PC, parar no celular). Ao parar, abre o formulário da sessão já com a duração preenchida.

**Horas efetivas** = duração × fator de qualidade. Tabela de fatores (editável em Configurações):

| Nota | Fator |
|---|---|
| 5 | 1.00 |
| 4 | 0.85 |
| 3 | 0.70 |
| 2 | 0.50 |
| 1 | 0.30 |

O progresso das metas de tempo usa **horas efetivas**. Sempre mostrar também as horas brutas ao lado, para comparação.

### Evolução

**skill_assessments**: id, skill_id, data, nivel (1–10), observacao — histórico de autoavaliações (sugerir reavaliação a cada 30 dias).

**metrics** (métricas próprias por área): id, user_id, area_id, nome, unidade, direcao (`maior_melhor` | `menor_melhor`), meta_valor (opcional)

**metric_entries**: id, metric_id, data, valor, observacao

**milestones** (marcos): id, user_id, area_id, skill_id (opcional), titulo, descricao, data

### Hábitos

**habits**: id, user_id, area_id (opcional), nome, frequencia (`diario` | dias da semana específicos), ativo, ordem

**habit_logs**: id, habit_id, data, concluido

### Revisões

**reviews**: id, user_id, tipo (`semanal` | `mensal`), periodo_inicio, periodo_fim, o_que_funcionou, onde_travei, prioridades_proximo_periodo, nota_geral (1–5), criado_em

## Dados iniciais (seed)

Criar um script de seed com a estrutura abaixo. Tudo deve ser editável pela interface depois.

### Áreas e habilidades

**1. Carreira — Gestão de Tráfego**
- Google Ads avançado — tipo `niveis`
- Meta Ads avançado — tipo `niveis`
- Tracking e mensuração (GTM, server-side) — tipo `niveis`
- Liderança de equipe — tipo `niveis`
- Métricas da área: nenhuma por padrão

**2. Negócios — Delfim**
- Prospecção e vendas — tipo `niveis`
- Gestão do negócio — tipo `niveis`
- Métricas: Faturamento mensal (R$), Clientes ativos (qtd), Propostas enviadas (qtd)

**3. Estudos**
- Faculdade — tipo `periodica` (meta inicial: 8h/semana)
- Métricas: nenhuma por padrão

**4. Idiomas**
- Inglês — tipo `niveis` (escala CEFR abaixo)
- Espanhol — tipo `niveis` (escala CEFR abaixo)

**5. Físico**
- Academia — tipo `periodica` (meta inicial: 4h/semana)
- Padel — tipo `niveis` + também acompanhar horas por semana no dashboard
- Métricas: Peso (kg, menor_melhor), % de gordura (%, menor_melhor)

**6. Mente e Hábitos**
- Sem habilidades por padrão; usar a parte de hábitos.

### Metas de tempo por nível

**Idiomas (escala CEFR)** — horas acumuladas aproximadas com base nas "Guided Learning Hours" da Cambridge English. São estimativas de referência, não regras:

| Nível | Horas acumuladas |
|---|---|
| A1 | 100 |
| A2 | 200 |
| B1 | 400 |
| B2 | 600 |
| C1 | 800 |
| C2 | 1200 |

**Habilidades gerais (escala heurística)** — usada para Carreira, Negócios e Padel:

| Nível | Horas acumuladas | Referência |
|---|---|---|
| Iniciante funcional | 20 | Ideia das "primeiras 20 horas" (Josh Kaufman) |
| Intermediário | 100 | Heurística |
| Avançado | 500 | Heurística |
| Expert | 1500 | Heurística |
| Maestria | 5000 | Heurística, inspirada nos estudos de prática deliberada (Ericsson) |

Em Configurações, permitir informar **horas já acumuladas antes de usar o sistema** por habilidade (ponto de partida), para o progresso não começar do zero em habilidades que já pratico há anos.

### Hábitos iniciais (diários)
- Meditar
- Ler
- Acordar até 6h
- Dia sem vídeos curtos / streaming
- Treinar

## Telas

1. **Dashboard**
   - Cards por área: horas efetivas na semana e no mês, variação vs. período anterior.
   - Gráfico radar com a distribuição de horas efetivas entre áreas (últimos 30 dias), para ver o que estou negligenciando.
   - Heatmap estilo GitHub de dias com prática (últimos 12 meses).
   - Hábitos do dia (checklist rápido) e streaks.
   - Metas próximas do prazo.
   - Botão grande "Registrar sessão" e atalho para o timer ativo.

2. **Registrar sessão** (mobile-first, deve ser feito em menos de 30 segundos)
   - Escolher habilidade (lista com as mais usadas no topo), duração (ou início/fim), nota de qualidade 1–5 com descrição curta de cada nota, foco específico.
   - Campos de reflexão (aprendizado, erros, próximo passo) opcionais e recolhidos por padrão.
   - Opção de iniciar timer.

3. **Áreas** — lista de áreas com resumo; dentro de cada área, suas habilidades, metas, métricas e marcos.

4. **Habilidade (detalhe)**
   - Barra de progresso até o próximo nível (horas efetivas acumuladas vs. alvo) + estimativa de quando chego lá no ritmo das últimas 4 semanas.
   - Para tipo `periodica`: progresso da semana/mês atual e histórico.
   - Gráfico de horas efetivas por semana.
   - Histórico de autoavaliações de nível.
   - Lista de sessões com as reflexões (para reler o que aprendi).
   - Média da nota de qualidade ao longo do tempo.

5. **Metas** — metas de resultado por status, com prazo e critério de conclusão.

6. **Métricas** — registro rápido de valores e gráfico de linha por métrica, com a meta como linha de referência.

7. **Marcos** — linha do tempo de conquistas.

8. **Hábitos** — checklist do dia, histórico em calendário, taxa de cumprimento semanal e mensal.

9. **Revisão semanal** — mostra automaticamente o resumo da semana (horas por área, hábitos, metas, sessões com melhores notas) e depois o formulário de perguntas. Mesma lógica para a revisão mensal.

10. **Configurações** — áreas, habilidades, níveis, metas periódicas, fatores de qualidade, horas iniciais, hábitos.

## Fases de desenvolvimento

Desenvolva **uma fase por vez**. Ao final de cada fase, pare, me diga o que foi feito e como testar, e espere minha aprovação antes de seguir.

1. **Setup**: projeto Next.js + Tailwind + shadcn/ui, conexão Supabase, login por magic link, migrations SQL de todas as tabelas com RLS, script de seed.
2. **Áreas e habilidades**: CRUD de áreas, habilidades, níveis e metas periódicas.
3. **Registro de prática**: formulário de sessão, cálculo de horas efetivas, timer sincronizado pelo banco.
4. **Página da habilidade**: progresso por nível ou período, estimativa de chegada, gráficos, autoavaliações.
5. **Hábitos**: CRUD, checklist diário, streaks, calendário.
6. **Metas, métricas e marcos**.
7. **Dashboard**: cards, radar, heatmap, resumo do dia.
8. **Revisões semanal e mensal**.
9. **PWA e deploy**: manifest, ícones, instalação no celular, deploy na Vercel com variáveis de ambiente documentadas.

## Regras gerais

- Código simples e legível; prefira Server Components e Server Actions do Next.js em vez de criar uma API separada.
- Todas as datas tratadas no fuso America/Sao_Paulo.
- Layout responsivo em todas as telas; telas de registro (sessão, hábito, métrica) pensadas primeiro para celular.
- Tema escuro e claro.
- Mantenha um `README.md` atualizado com como rodar localmente, variáveis de ambiente e como rodar migrations e seed.
- Se algo nesta especificação estiver ambíguo ou parecer uma má ideia técnica, pergunte antes de implementar.
