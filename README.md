# Echo

Sistema pessoal de progresso baseado em prática deliberada: registro a prática e o Echo devolve onde estou evoluindo. Parte da família Delfim.

Stack: Next.js 16 (App Router, Cache Components) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS 4 · shadcn/ui · Recharts.

Produção: https://delfimecho.vercel.app

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha (as mesmas variáveis vão na Vercel):

| Variável | Onde achar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Mesmo lugar: chave *publishable* (ou a *anon* legada) |
| `ALLOWED_EMAIL` | Seu e-mail — o único que consegue entrar |

O app não usa a chave secreta (*service role*) em lugar nenhum. Nenhuma URL do site fica fixa no código: o magic link volta para a origem de onde o login foi pedido.

## Configuração do Supabase (pelo painel)

Feito uma vez só, no projeto do Supabase:

1. **Usuário** — *Authentication → Users → Add user → Create new user* com o mesmo e-mail de `ALLOWED_EMAIL`, marcando *Auto Confirm User*.
2. **Bloquear cadastros** — *Authentication → Sign In / Providers*: desligue *Allow new users to sign up*. O login nunca cria contas; só entra quem já existe.
3. **URLs** — *Authentication → URL Configuration*:
   - *Site URL*: `https://delfimecho.vercel.app`
   - *Redirect URLs*: `http://localhost:3000/**` e `https://delfimecho.vercel.app/**`
4. **Migration inicial** — *SQL Editor → New query*: cole o conteúdo de [supabase/migrations/20261012000000_schema_inicial.sql](supabase/migrations/20261012000000_schema_inicial.sql) e clique em *Run*. Rode uma vez só. As migrations seguintes são aplicadas pelo CLI (veja [Migrations](#migrations-supabase-cli)).
5. **Seed** — *SQL Editor → New query*: cole o conteúdo de [supabase/seed.sql](supabase/seed.sql), troque `seu-email@exemplo.com` pelo seu e-mail na linha marcada no topo e clique em *Run*. O resultado mostra as contagens (6 áreas, 11 habilidades, 47 níveis, 2 metas periódicas, 5 métricas, 5 hábitos, 5 fatores). O seed é idempotente: rodar de novo só recria o que estiver faltando, comparando pelo nome.

O e-mail usa o **template padrão** do Supabase (editar templates exige SMTP próprio).

## Login (magic link)

1. Em `/login`, informe o `ALLOWED_EMAIL` e clique em *Enviar link de acesso*.
2. O link do e-mail passa pelo Supabase e volta para `/auth/confirm?code=…` no mesmo endereço em que o login foi pedido (localhost ou Vercel). Essa rota troca o `code` pela sessão (fluxo PKCE).
3. **Abra o link no mesmo navegador em que o pediu.** A troca usa um cookie gravado quando o link foi pedido; outro navegador (ou o navegador interno do app de e-mail, no celular) não tem esse cookie. Para entrar no celular, peça o link pelo navegador do celular e abra o e-mail ali (no app de e-mail, use "abrir no navegador" se necessário).
4. Se falhar, a tela de login mostra o motivo e o código do erro (ex.: `otp_expired` = link expirado ou já usado; `pkce_code_verifier_not_found` = aberto em outro navegador). Cada link vale uma vez só, e só o último pedido é válido.

Se uma variável de ambiente estiver faltando, o site mostra uma página "configuração incompleta" com o nome dela, em vez de um erro 500.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000, informe o `ALLOWED_EMAIL` e clique no link que chegar no e-mail.

## Deploy (Vercel)

O projeto está ligado ao repositório no GitHub: cada push na `main` gera um deploy em https://delfimecho.vercel.app.

Em *Vercel → Project → Settings → Environment Variables*, cadastre (para *Production* e *Preview*):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ALLOWED_EMAIL`

Variáveis `NEXT_PUBLIC_*` entram no build: depois de alterá-las, faça um *Redeploy*.

No Supabase, as URLs do passo 3 acima precisam incluir `https://delfimecho.vercel.app/**`. Para usar previews da Vercel (`*.vercel.app` de branches), adicione também a URL do preview em *Redirect URLs*.

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

## Modelo de dados (resumo)

- Todas as tabelas têm `user_id` e RLS `user_id = auth.uid()`.
- **Horas efetivas** = duração × fator da nota de qualidade (tabela `quality_factors`, editável). A view `practice_sessions_horas` entrega `horas_brutas`, `horas_efetivas` e `data_local` (dia em America/Sao_Paulo).
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
