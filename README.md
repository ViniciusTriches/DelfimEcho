# Echo

Sistema pessoal de progresso baseado em prática deliberada: registro a prática e o Echo devolve onde estou evoluindo. Parte da família Delfim.

Stack: Next.js 16 (App Router, Cache Components) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS 4 · shadcn/ui · Recharts.

## Requisitos

- Node.js 20+
- Um projeto no [Supabase](https://supabase.com) **ou** Docker (para o Supabase local)

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde achar | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | App e seed |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Mesmo lugar (chave *publishable*, ou a *anon* legada) | App |
| `SUPABASE_SECRET_KEY` | Mesmo lugar (chave *secret*, ou a *service_role* legada) | **Só o seed.** Nunca exponha. |
| `ALLOWED_EMAIL` | Seu e-mail | Único e-mail que pode entrar; o seed cria esse usuário |
| `NEXT_PUBLIC_SITE_URL` | Opcional | URL pública usada no link do e-mail |

## Rodando com Supabase na nuvem (recomendado)

1. Crie o projeto no Supabase.
2. **Auth → Sign In / Providers**: desligue *Allow new users to sign up* (o usuário é criado pelo seed).
3. **Auth → URL Configuration**: *Site URL* `http://localhost:3000` e, em *Redirect URLs*, adicione `http://localhost:3000/**` (e depois a URL da Vercel).
4. **Auth → Emails → Magic Link**: troque o corpo pelo conteúdo de [supabase/templates/magic_link.html](supabase/templates/magic_link.html). Assim o link funciona mesmo se você pedir no PC e abrir no celular. (Com o template padrão também funciona, mas só no mesmo navegador.)
5. Aplique as migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref-do-projeto>
   npm run db:push
   ```
   Alternativa sem CLI: cole o conteúdo de `supabase/migrations/*.sql` no SQL Editor, em ordem.
6. Instale e rode:
   ```bash
   npm install
   npm run seed
   npm run dev
   ```
7. Abra http://localhost:3000, informe o `ALLOWED_EMAIL` e clique no link recebido.

## Rodando com Supabase local (Docker)

```bash
npm install
npm run db:start      # sobe o Supabase e aplica as migrations
npx supabase status   # mostra URL e chaves para o .env.local
npm run seed
npm run dev
```

Os e-mails locais não são enviados de verdade: abra o Mailpit em http://localhost:54324 para clicar no magic link. A config local ([supabase/config.toml](supabase/config.toml)) já desliga o cadastro público e usa o template de magic link do projeto.

## Migrations e seed

- Migrations ficam em [supabase/migrations/](supabase/migrations/). Para criar uma nova: `npx supabase migration new <nome>`.
- Local: `npm run db:reset` recria o banco do zero com todas as migrations (depois rode o seed de novo).
- Nuvem: `npm run db:push` aplica as migrations pendentes.
- `npm run seed` cria (se necessário) o usuário de `ALLOWED_EMAIL` e os dados iniciais: 6 áreas, 11 habilidades com níveis/metas periódicas, 5 métricas e 5 hábitos. Só roda se o usuário ainda não tiver áreas.
- `npm run seed -- --reset` **apaga todos os dados** do usuário e recria o seed.

## Modelo de dados (resumo)

- Todas as tabelas têm `user_id` e RLS `user_id = auth.uid()`.
- **Horas efetivas** = duração × fator da nota de qualidade (tabela `quality_factors`, editável). A view `practice_sessions_horas` já entrega `horas_brutas`, `horas_efetivas` e `data_local` (dia em America/Sao_Paulo).
- `skills.horas_iniciais`: horas acumuladas antes de usar o Echo (ponto de partida).
- `skills.destaque_dashboard`: mostra as horas da semana da habilidade no dashboard (ex.: Padel).
- `habits.dias_semana`: 1 = segunda … 7 = domingo.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` / `npm run typecheck` | Lint e checagem de tipos |
| `npm run seed` | Dados iniciais |
| `npm run db:start` / `db:stop` / `db:reset` / `db:push` | Supabase CLI |
