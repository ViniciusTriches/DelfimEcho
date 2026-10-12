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
4. **Template do e-mail** — *Authentication → Emails → Magic Link*: substitua o corpo pelo conteúdo de [supabase/templates/magic_link.html](supabase/templates/magic_link.html). Com ele o link funciona mesmo abrindo em outro aparelho ou navegador (pedir no PC, abrir no celular). Com o template padrão também funciona, mas só no mesmo navegador em que o link foi pedido.
5. **Migration** — *SQL Editor → New query*: cole o conteúdo de [supabase/migrations/20261012000000_schema_inicial.sql](supabase/migrations/20261012000000_schema_inicial.sql) e clique em *Run*. Rode uma vez só. Migrations futuras ficarão na mesma pasta e devem ser rodadas em ordem de nome.
6. **Seed** — *SQL Editor → New query*: cole o conteúdo de [supabase/seed.sql](supabase/seed.sql), troque `seu-email@exemplo.com` pelo seu e-mail na linha marcada no topo e clique em *Run*. O resultado mostra as contagens (6 áreas, 11 habilidades, 47 níveis, 2 metas periódicas, 5 métricas, 5 hábitos, 5 fatores). O seed é idempotente: rodar de novo só recria o que estiver faltando, comparando pelo nome.

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

## Modelo de dados (resumo)

- Todas as tabelas têm `user_id` e RLS `user_id = auth.uid()`.
- **Horas efetivas** = duração × fator da nota de qualidade (tabela `quality_factors`, editável). A view `practice_sessions_horas` entrega `horas_brutas`, `horas_efetivas` e `data_local` (dia em America/Sao_Paulo).
- `skills.horas_iniciais`: horas acumuladas antes de usar o Echo (ponto de partida).
- `skills.destaque_dashboard`: mostra as horas da semana da habilidade no dashboard (ex.: Padel).
- `habits.dias_semana`: 1 = segunda … 7 = domingo.

## Opcional: Supabase CLI

Não é necessário para usar o Echo. Se quiser aplicar migrations pelo terminal ou rodar o Supabase localmente (requer Docker):

```bash
# Projeto na nuvem
npx supabase login
npx supabase link --project-ref <ref-do-projeto>
npx supabase db push          # aplica migrations pendentes

# Supabase local
npx supabase start            # sobe tudo e aplica as migrations
npx supabase status           # URL e chaves para o .env.local
```

No Supabase local, crie o usuário no Studio (http://localhost:54323), rode o `seed.sql` no SQL Editor dele e abra os e-mails no Mailpit (http://localhost:54324). A config local ([supabase/config.toml](supabase/config.toml)) já desliga cadastros públicos e usa o template de magic link do projeto. Para criar uma migration nova: `npx supabase migration new <nome>`.
