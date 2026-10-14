# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Um único usuário: o dono do Echo (gestor de tráfego, empreendedor da Delfim, estudante). Usa todos os dias em dois contextos:

- **PC:** com calma — dashboard, revisões semanais e mensais, planejamento da semana, leitura de reflexões e gráficos.
- **Celular:** em segundos, muitas vezes no meio de outra coisa (academia, padel, entre tarefas) — registrar sessão, timer, marcar hábitos, anotar uma métrica.

## Product Purpose

Acompanhar o progresso em habilidades, negócios e áreas da vida com base em **prática deliberada**: progresso não vem só de horas, mas de horas bem gastas. O usuário registra a prática; o Echo devolve onde ele está evoluindo. Sucesso = registrar sem atrito todos os dias e enxergar com clareza onde evolui e onde está negligenciando.

## Positioning

Horas efetivas, não horas brutas: a nota de qualidade de cada sessão (e prática ativa/passiva) pondera as horas; níveis por horas acumuladas (CEFR, heurística geral), próximo passo encadeado entre sessões, distrações contadas no timer, revisões semanais/mensais com planejado × realizado. O nome vem da ecolocalização do golfinho (família da marca Delfim, junto com o Delfim Sonar).

## Operating Context

- Ritual diário: hábitos do dia, registro de sessões (às vezes pelo timer, iniciado num aparelho e encerrado em outro).
- Ritual semanal: revisão da semana (domingo) → planejar a próxima semana.
- Ritual mensal: revisão do mês com métricas, metas concluídas e marcos.
- Interface em pt-BR, fuso America/Sao_Paulo, semana começando na segunda.

## Capabilities and Constraints

- Áreas → habilidades (metas de tempo por níveis ou periódicas) → sessões; hábitos; metas de resultado; métricas; marcos; revisões; plano da semana; timer com modo foco.
- Stack existente: Next.js 16 (App Router, Cache Components) + Tailwind CSS 4 + shadcn/ui (Base UI) + Supabase + Recharts; deploy na Vercel. Uso pessoal, um usuário, login por e-mail e senha.
- Registro de sessão no celular deve levar menos de 30 segundos.
- Regras de negócio, cálculos e banco não mudam em trabalho de design.

## Brand Commitments

- Nome "Echo" (ecolocalização), família Delfim.
- Pedido explícito do usuário (out/2026): linguagem visual Material Design 3, implementada nos componentes atuais (sem @material/web); sensação clara, quente e acolhedora (creme, areia, bege; nunca branco ou preto puros); primária teal suave; Roboto/Roboto Mono; tema claro como padrão; animações com Motion (GSAP só onde agregar).

## Evidence on Hand

Dados reais do próprio usuário (sessões, hábitos, métricas, metas). Não há depoimentos, clientes ou métricas públicas — e não devem ser inventados.

## Product Principles

1. Registrar é sagrado: a ação mais frequente nunca espera nada (animação, confirmação, carregamento).
2. Qualidade acima de quantidade: horas efetivas em primeiro plano, horas brutas sempre ao lado para comparação.
3. Calma para uso diário: confortável por muito tempo, sem ruído, celebrações discretas.
4. Honestidade nos números: comparações justas (mesmo ponto do período anterior), nada que maquie o progresso.
5. Um toque para o essencial no celular: Registrar e Hábitos sempre à mão.

## Accessibility & Inclusion

Padrão do projeto: contraste mínimo 4,5:1 para texto e 3:1 para elementos gráficos, foco visível, alvos de toque de 44px no celular, rótulos visíveis, ícones sem emoji, respeito a prefers-reduced-motion. Sem necessidades adicionais declaradas.
