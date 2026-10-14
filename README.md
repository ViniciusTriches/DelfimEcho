# Echo

Sistema pessoal de progresso baseado em prática deliberada: registro a prática e o Echo devolve onde estou evoluindo. Parte da família Delfim.

- **Produção:** https://delfimecho.vercel.app (instalável como app no celular; veja [Instalar no celular](#instalar-no-celular))
- **Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS 4 · shadcn/ui (Base UI) · Recharts · Motion (GSAP só na comemoração de nível)
- **Design:** Material Design 3 com paleta quente. O registro do sistema é o [DESIGN.md](DESIGN.md); o guia com tabelas e checklist é o [docs/design-system.md](docs/design-system.md).

## O que o app faz

- **Início:** card "Hoje no calendário" (próximos blocos com "Iniciar"), hábitos de hoje, alertas (habilidades paradas, metas vencendo, revisões pendentes), registro rápido de métricas, plano da semana (planejado × realizado por área), cartões por área, radar de distribuição e heatmap de 12 meses.
- **Calendário** (`/calendario`): visões Dia (padrão no celular, com deslizar entre dias), Semana (padrão no PC; compacta no celular) e Mês. Blocos planejados por habilidade (com repetição semanal), sessões feitas, prazos de metas e marcos. Criar tocando num horário ou arrastando; no PC, arrastar para mover e puxar a borda para mudar a duração. Do bloco: iniciar timer ou registrar como feito. Resumo da semana: plano × agendado × feito.
- **Registrar sessão** (`/registrar`): habilidades mais usadas, duração ou início e fim, nota de qualidade 1–5 com prévia das horas efetivas, próximo passo encadeado, prática ativa/passiva e reflexão. Comemoração ao subir de nível.
- **Timer** (`/timer`, guardado no banco, funciona entre aparelhos): pausar, "Me distraí", modo foco e nota sugerida ao encerrar. Sem timer, oferece começar pelo próximo bloco do dia ou pelas habilidades mais usadas.
- **Hábitos** (`/habitos`): checklist do dia, sequências, cumprimento da semana e do mês, calendário mensal e gerenciamento.
- **Áreas e habilidades:** metas de tempo por níveis (escalas CEFR e Geral) ou periódicas, autoavaliação, gráficos e histórico de sessões.
- **Metas, Métricas, Marcos, Revisões semanais e mensais e Plano da semana** (no menu "Mais").
- **Configurações:** fatores de qualidade, fator da prática passiva, alerta de abandono e faixa de horário do calendário.

## Rodando localmente

Requisitos: Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env.local   # preencha (veja abaixo)
npm run dev
```

Abra http://localhost:3000 e entre com o `ALLOWED_EMAIL` e a senha. O service worker só é registrado em produção (`npm run build && npm start` para testar o PWA localmente).

### Variáveis de ambiente

| Variável | Onde achar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Mesmo lugar: chave *publishable* (ou a *anon* legada) |
| `ALLOWED_EMAIL` | Seu e-mail, o único que consegue entrar |

O app não usa a chave secreta (*service role*) em lugar nenhum. Todo acesso ao Supabase acontece no servidor, com RLS em todas as tabelas. Se faltar alguma variável, o site mostra uma página "configuração incompleta" com o nome dela, em vez de um erro 500.

## Deploy (Vercel)

O projeto está ligado ao repositório no GitHub: **cada push na `main` gera um deploy** em https://delfimecho.vercel.app. As funções rodam em `gru1` (São Paulo), a mesma região do banco (`vercel.json`).

1. Em *Vercel → Project → Settings → Environment Variables*, cadastre para *Production* e *Preview*: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `ALLOWED_EMAIL`.
2. Variáveis `NEXT_PUBLIC_*` entram no build: depois de alterá-las, faça um *Redeploy*.
3. O build (`npm run build`) gera o `public/sw.js` com a versão do commit. Os apps instalados percebem o deploy novo e mostram "Nova versão disponível" com o botão **Atualizar**.

Com login por senha não há redirecionamento pelo Supabase, então *Site URL* e *Redirect URLs* não precisam de configuração (nem em localhost, nem em previews).

## Supabase

### Configuração inicial (uma vez, pelo painel)

1. **Usuário:** *Authentication → Users → Add user → Create new user* com o e-mail de `ALLOWED_EMAIL`, uma senha e *Auto Confirm User* marcado.
2. **Bloquear cadastros:** *Authentication → Sign In / Providers*: desligue *Allow new users to sign up* e deixe o provedor *Email* ligado.
3. **Sessões longas:** em *Authentication → Sessions*, mantenha desligados *Time-box user sessions* e *Inactivity timeout*. O cookie da sessão dura 400 dias e o token é renovado a cada acesso.
4. **Migration inicial:** no *SQL Editor*, rode [supabase/migrations/20261012000000_schema_inicial.sql](supabase/migrations/20261012000000_schema_inicial.sql) uma vez. As demais vão pelo CLI (abaixo).
5. **Seed:** no *SQL Editor*, rode [supabase/seed.sql](supabase/seed.sql) trocando `seu-email@exemplo.com` pelo seu e-mail. É idempotente.

### Migrations (Supabase CLI)

Os scripts usam `npx supabase@2.120.0`, então não é preciso instalar nada.

**Uma vez por máquina:**

```bash
npx supabase@2.120.0 login
npx supabase@2.120.0 link --project-ref <ref>   # ref = parte da URL https://<ref>.supabase.co
npm run db:status
```

Se o `db:status` mostrar `20261012000000` só em *Local* (a inicial foi aplicada pelo painel), registre-a como aplicada. Isso só grava no histórico, sem rodar o SQL de novo:

```bash
npx supabase@2.120.0 migration repair --status applied 20261012000000
```

**Para cada mudança no banco:**

```bash
npm run db:new -- nome_da_mudanca   # cria supabase/migrations/<timestamp>_nome_da_mudanca.sql
npm run db:push                      # aplica só as pendentes no projeto remoto
npm run db:types                     # regenera src/lib/database.types.ts
```

**Nunca** rode `supabase db reset` (ou similares) com `--linked` ou no projeto remoto: isso apaga os dados.

### Senha

Para definir ou trocar a senha sem e-mail, rode no *SQL Editor*:

```sql
update auth.users
set encrypted_password = extensions.crypt('SUA_NOVA_SENHA', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'seu-email@exemplo.com';
```

Apague a query do histórico do SQL Editor depois. Trocar a senha não encerra sessões abertas em outros aparelhos.

## Instalar no celular

O Echo é um PWA: instalado, abre em tela cheia, com ícone próprio, sem a barra do navegador. Os dados sempre vêm do servidor, e o cache guarda só arquivos estáticos (JS, CSS, fontes e ícones). Sem internet, aparece uma página "Sem conexão" que recarrega sozinha quando a rede volta.

### Android (Chrome)

1. Abra https://delfimecho.vercel.app no Chrome e entre.
2. Toque em **⋮ → Instalar app** (ou **Adicionar à tela inicial → Instalar**). O Chrome também pode oferecer a instalação sozinho, num aviso embaixo.
3. O ícone do Echo aparece na tela inicial e na gaveta de apps.
4. **Atalhos:** pressione e segure o ícone para ver *Registrar sessão*, *Calendário de hoje*, *Iniciar timer* e *Hábitos de hoje*.

### iPhone (Safari)

1. Abra https://delfimecho.vercel.app **no Safari** (a instalação pelo iPhone só funciona por ele) e entre.
2. Toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início** → **Adicionar**.
3. Abra pelo ícone: o Echo ocupa a tela toda, respeita o notch e a barra inferior e mostra a tela de abertura creme.
4. Se o app pedir login, entre uma vez: dependendo da versão do iOS, a sessão do Safari não é levada para o app instalado.

### Atualizações

A cada deploy, o app instalado mostra a mensagem **"Nova versão disponível"**. Toque em **Atualizar** para recarregar com a versão nova. Nada muda sem esse toque, e os dados nunca ficam presos numa versão antiga.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o service worker com a versão do build e faz o build de produção |
| `npm start` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rotas do Next e roda o `tsc` |
| `npm run tema` | Regenera os tokens de cor (`src/app/tema.css`) a partir das cores-fonte |
| `npm run icones` | Regenera ícones, favicon, atalhos e telas de abertura do iPhone (usa o Chrome; outro caminho: `CHROME=...`) |
| `npm run db:status` | Migrations locais × aplicadas no projeto remoto |
| `npm run db:new -- <nome>` | Cria um arquivo de migration novo |
| `npm run db:push` | Aplica no projeto remoto as migrations pendentes |
| `npm run db:types` | Regenera `src/lib/database.types.ts` a partir do banco |

## Modelo de dados (resumo)

- Todas as tabelas têm `user_id` e RLS `user_id = auth.uid()`.
- **Horas efetivas** = duração × fator da nota de qualidade (`quality_factors`) × fator da prática passiva (`user_settings`, só em sessões passivas). A view `practice_sessions_horas` entrega `horas_brutas`, `horas_efetivas` e `data_local` (dia em America/Sao_Paulo).
- `planned_blocks`: blocos do calendário. Repetição semanal em `repete_dias` (1 = segunda … 7 = domingo) até `repete_ate`; ocorrências apagadas ou editadas "só esta" ficam em `datas_excluidas`. As ocorrências são geradas na leitura.
- `active_timer`: no máximo um por usuário, com foco, distrações e pausa.
- `weekly_plans`: horas planejadas por área para cada semana (segunda-feira).
- `user_settings`: fator passivo, dias do alerta de abandono e faixa de horário do calendário.
