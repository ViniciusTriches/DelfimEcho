# Echo

Sistema pessoal de progresso baseado em prática deliberada: registro a prática e o Echo devolve onde estou evoluindo. Parte da família Delfim.

Stack: Next.js 16 (App Router, Cache Components) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS 4 · shadcn/ui · Recharts.

Produção: https://delfimecho.vercel.app

## O que já existe

- **Login** por e-mail e senha, sessão persistente.
- **Áreas** (`/areas`): criar, editar (nome, descrição, cor, ícone), reordenar, arquivar/restaurar e excluir.
- **Habilidades** (dentro de cada área): criar, editar, mover de área, reordenar, arquivar/restaurar e excluir. Cada uma tem:
  - meta de tempo por **níveis** (editor com escalas prontas CEFR e Geral, ou níveis próprios), **periódica** (horas por semana e/ou mês) ou **nenhuma**;
  - horas antes do Echo (ponto de partida), autoavaliação 1–10 e opção de destacar no dashboard.
- Arquivar esconde sem apagar; excluir apaga em cascata (sessões incluídas) e pede confirmação mostrando o que será perdido.
- **Registrar sessão** (`/registrar`, pensado para o celular):
  - habilidades mais usadas (últimos 90 dias) como atalho; duração em minutos (com atalhos) ou início e fim;
  - nota de qualidade 1–5 com a descrição e o fator de cada nota, e prévia das horas efetivas;
  - **próximo passo encadeado**: o "próximo passo" da última sessão da habilidade vira a sugestão de foco;
  - **prática ativa/passiva** nas habilidades com "Permite prática passiva" (ligado em Idiomas);
  - reflexão (aprendizado, erros, próximo passo, feedback) recolhida por padrão; lista das últimas sessões com opção de excluir.
- **Timer** (`/timer`), guardado no banco: começa num aparelho e termina em outro. Pausar/retomar, botão **"Me distraí"** (conta distrações) e **modo foco** em tela cheia (mantém a tela acesa quando o navegador permite). Ao encerrar, abre o registro com a duração (sem as pausas) e uma nota sugerida pela taxa de distrações (0 → 5; até 1 a cada 30 min → 4; até 2 → 3; até 4 → 2; mais → 1). O timer ativo aparece no cabeçalho.
- **Página da habilidade** (`/habilidades/[id]`): totais de horas efetivas e brutas (incluindo as horas antes do Echo), últimas 4 semanas, nota média;
  - **níveis**: barra até o próximo nível, escada de níveis atingidos e estimativa de chegada no ritmo das últimas 4 semanas;
  - **periódica**: progresso da semana/mês atual e em quantos períodos anteriores a meta foi batida;
  - gráficos de horas por semana (e por mês, se houver meta mensal), qualidade média por semana e histórico de autoavaliações (com aviso para se reavaliar a cada 30 dias);
  - sessões com as reflexões, para reler o que aprendeu.
- **Hábitos** (`/habitos`):
  - checklist do dia com marcação otimista (toque e já aparece), navegação para dias anteriores, progresso do dia, sequência atual (chama) e mini semana por hábito;
  - cumprimento da semana e do mês (geral e por hábito) e sequência atual/melhor; só contam dias previstos desde a data "acompanhar desde", e hoje entra quando for feito;
  - histórico em calendário mensal (todos os hábitos ou um só);
  - gerenciar (`/habitos/gerenciar`): criar, editar (todos os dias ou dias específicos, área, acompanhar desde), reordenar, pausar/retomar e excluir.
- **Configurações** (`/configuracoes`): fatores de qualidade (e as descrições das notas) e fator da prática passiva. Mudar um fator recalcula as horas efetivas de todas as sessões.

## Design

As telas seguem o design system em [docs/design-system.md](docs/design-system.md) (gerado com o plugin ui-ux-pro-max). A troca global de paleta e fontes acontece numa fase de revisão de design antes do PWA.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (as mesmas variáveis vão na Vercel):

| Variável | Onde achar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Mesmo lugar: chave *publishable* (ou a *anon* legada) |
| `ALLOWED_EMAIL` | Seu e-mail — o único que consegue entrar |

O app não usa a chave secreta (*service role*) em lugar nenhum.

## Configuração do Supabase (pelo painel)

Feito uma vez só, no projeto do Supabase:

1. **Usuário** — *Authentication → Users → Add user → Create new user* com o mesmo e-mail de `ALLOWED_EMAIL`, uma senha e *Auto Confirm User* marcado. (Para definir ou trocar a senha depois, veja [Senha](#senha).)
2. **Bloquear cadastros** — *Authentication → Sign In / Providers*: desligue *Allow new users to sign up* e deixe o provedor *Email* ligado (é ele que permite login com senha).
3. **Migration inicial** — *SQL Editor → New query*: cole o conteúdo de [supabase/migrations/20261012000000_schema_inicial.sql](supabase/migrations/20261012000000_schema_inicial.sql) e clique em *Run*. Rode uma vez só. As migrations seguintes são aplicadas pelo CLI (veja [Migrations](#migrations-supabase-cli)).
4. **Seed** — *SQL Editor → New query*: cole o conteúdo de [supabase/seed.sql](supabase/seed.sql), troque `seu-email@exemplo.com` pelo seu e-mail na linha marcada no topo e clique em *Run*. O resultado mostra as contagens (6 áreas, 11 habilidades, 47 níveis, 2 metas periódicas, 5 métricas, 5 hábitos, 5 fatores). O seed é idempotente: rodar de novo só recria o que estiver faltando, comparando pelo nome.

## Login

- Login com **e-mail e senha** (`signInWithPassword`). Só o `ALLOWED_EMAIL` entra; qualquer outro e-mail recebe a mesma resposta de "e-mail ou senha incorretos". Nenhum e-mail é enviado, então não há limite de envio do Supabase envolvido.
- Erros aparecem com o código do Supabase entre parênteses, ex.: `(invalid_credentials)`, `(email_not_confirmed)`, `(over_request_rate_limit)`.
- **Sessão persistente:** o cookie da sessão dura 400 dias (o máximo dos navegadores) e o token é renovado automaticamente a cada acesso, então você só precisa entrar de novo se sair, limpar os cookies ou ficar mais de 400 dias sem abrir o Echo naquele aparelho. Para isso funcionar, mantenha desligados *Time-box user sessions* e *Inactivity timeout* em *Authentication → Sessions* (já vêm desligados).
- **Sair** (botão no topo) encerra só a sessão do aparelho atual; os outros continuam logados.

Se uma variável de ambiente estiver faltando, o site mostra uma página "configuração incompleta" com o nome dela, em vez de um erro 500.

## Senha

Para definir ou redefinir a senha sem e-mail, rode no *SQL Editor* (troque a senha e o e-mail):

```sql
update auth.users
set encrypted_password = extensions.crypt('SUA_NOVA_SENHA', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'seu-email@exemplo.com';
```

O resultado deve ser *1 row affected*. A senha fica no histórico de queries do SQL Editor: apague a query depois de rodar. Trocar a senha não encerra as sessões já abertas nos outros aparelhos.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 e entre com o `ALLOWED_EMAIL` e a senha.

## Deploy (Vercel)

O projeto está ligado ao repositório no GitHub: cada push na `main` gera um deploy em https://delfimecho.vercel.app.

Em *Vercel → Project → Settings → Environment Variables*, cadastre (para *Production* e *Preview*):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_EMAIL`

Variáveis `NEXT_PUBLIC_*` entram no build: depois de alterá-las, faça um *Redeploy*.

Com login por senha não há redirecionamento pelo Supabase, então *Site URL* e *Redirect URLs* não precisam de configuração para o Echo funcionar (nem em localhost, nem em previews da Vercel).

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rotas do Next e roda o `tsc` |
| `npm run db:status` | Migrations locais × aplicadas no projeto remoto |
| `npm run db:new -- <nome>` | Cria um arquivo de migration novo |
| `npm run db:push` | Aplica no projeto remoto as migrations pendentes |
| `npm run db:types` | Regenera `src/lib/database.types.ts` a partir do banco (rode após cada migration) |

## Modelo de dados (resumo)

- Todas as tabelas têm `user_id` e RLS `user_id = auth.uid()`.
- **Horas efetivas** = duração × fator da nota de qualidade (`quality_factors`) × fator da prática passiva (`user_settings`, só em sessões passivas). A view `practice_sessions_horas` entrega `horas_brutas`, `horas_efetivas` e `data_local` (dia em America/Sao_Paulo).
- `active_timer`: no máximo um por usuário, com foco, distrações e pausa (`pausado_em` + `segundos_pausados`).
- `skills.horas_iniciais`: horas acumuladas antes de usar o Echo (ponto de partida).
- `skills.destaque_dashboard`: mostra as horas da semana da habilidade no dashboard (ex.: Padel).
- `habits.dias_semana`: 1 = segunda … 7 = domingo.

## Migrations (Supabase CLI)

A migration inicial foi aplicada pelo SQL Editor; as seguintes são aplicadas pelo CLI. Os scripts usam `npx supabase@2.120.0` (não precisa instalar nada).

**Uma vez por máquina:**

```bash
npx supabase@2.120.0 login
npx supabase@2.120.0 link --project-ref <ref-do-projeto>   # ref = parte da URL https://<ref>.supabase.co
npm run db:status
```

Se o `db:status` mostrar `20261012000000` só na coluna *Local* (a inicial foi aplicada pelo painel, então o histórico remoto está vazio), registre-a como já aplicada — isso **não** roda o SQL de novo, só grava no histórico:

```bash
npx supabase@2.120.0 migration repair --status applied 20261012000000
npm run db:status   # agora deve aparecer nas duas colunas
```

**Para cada migration nova:**

```bash
npm run db:new -- nome_da_mudanca   # cria supabase/migrations/<timestamp>_nome_da_mudanca.sql
npm run db:push                      # aplica só as pendentes
```

Nunca rode `supabase db reset` (ou similares) com `--linked`/no projeto remoto: apaga os dados.
