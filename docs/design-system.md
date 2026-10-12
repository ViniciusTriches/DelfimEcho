# Echo — Design System

Gerado em 2026-10-12 com o plugin **ui-ux-pro-max** (v2.15.0) e adaptado ao Echo: app pessoal de progresso em habilidades, uso diário no PC e no celular, tema claro e escuro, família da marca Delfim. Stack: Next.js + Tailwind CSS 4 + shadcn/ui.

**Como foi gerado:** duas execuções do gerador (`--design-system`, dials: variação 3, movimento 3, densidade 6), com as buscas "personal productivity habit tracker dashboard" e "personal progress tracking dashboard app". Depois, buscas por domínio para cor, tipografia, produto e UX. Cada seção abaixo diz de onde veio a recomendação e onde ela foi adaptada. As saídas brutas estão no [Apêndice](#apêndice-saídas-brutas-do-gerador).

**Aplicação:**
- **Telas novas (a partir da Fase 5):** seguem as regras de estilo, layout, componentes e UX deste documento e usam os tokens semânticos novos (sequência e concluído).
- **Troca global de paleta e fontes:** acontece na fase de revisão de design (depois da Fase 8, antes do PWA). Trocar agora mudaria as telas existentes, e isso ficou para essa fase. Até lá, as telas novas usam os tokens atuais do shadcn (`primary`, `muted`, `border`…), então ficam consistentes com o resto e herdam a paleta nova automaticamente.

---

## 1. Estilo — Minimalism & Swiss Style

*Fonte: as duas execuções do gerador escolheram este estilo, indicado para "dashboards, SaaS, ferramentas profissionais".*

- Limpo, funcional, muito espaço em branco, alto contraste, grade, sans-serif, só o essencial.
- Claro e escuro com suporte completo.
- Efeitos: hover sutil (150–250 ms), transições suaves, sombras discretas ou nenhuma, hierarquia tipográfica clara.
- O dado é o protagonista. Cor só onde carrega significado (área, estado, progresso).

**Descartado:** o perfil "Habit Tracker" do plugin sugere *Claymorphism + Vibrant & Block-based*. Faz sentido num app só de hábitos; o Echo é um painel de progresso, e o Swiss combina melhor com os gráficos e números. Do perfil de hábitos aproveitamos só o foco de cor (âmbar para sequência, verde para progresso).

## 2. Paleta

*Fonte: perfil exato **"Productivity Tool"** do plugin (domínio `color`): teal de foco + laranja de ação. O teal fica perto do azul-oceano da família Delfim.*

### Claro (valores do plugin)

| Papel | Hex | Uso |
|---|---|---|
| Primary | `#0D9488` | botões principais, links, foco, item ativo |
| On Primary | `#000000` | texto sobre o primary (preto: 5,6:1; branco não passa 4,5:1) |
| Secondary | `#14B8A6` | apoio, realces suaves |
| Accent / CTA | `#EA580C` | ação de destaque pontual (ex.: "Registrar sessão") |
| Background | `#F0FDFA` | fundo da página |
| Foreground | `#134E4A` | texto principal |
| Card | `#FFFFFF` | cartões |
| Muted | `#E8F1F4` | fundos neutros, trilhas de barra |
| Muted Foreground | `#475569` | texto secundário |
| Border | `#99F6E4` | bordas (avaliar suavizar na revisão) |
| Destructive | `#DC2626` | excluir, erro |
| Ring | `#0D9488` | anel de foco |

### Escuro (derivado — o plugin entregou só o claro)

Proposta para validar na fase de revisão, mesma família de matiz: background `#0B1514`, card `#122120`, foreground `#E6F4F1`, muted `#1C2B2A`, muted-foreground `#94A3B8`, border `#1F3A37`, primary `#2DD4BF` (texto preto por cima), accent `#FB923C`, destructive `#EF4444`. Precisa de checagem de contraste 4,5:1 antes de aplicar.

### Tokens semânticos (já valem para telas novas)

*Fonte: notas do gerador ("Streak amber + habit green") e foco de cor do perfil "Habit Tracker".*

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--sequencia` | `#D97706` | `#F59E0B` | sequência (streak): ícone de chama, contador |
| `--concluido` | `#059669` | `#10B981` | hábito feito, meta batida |

Sempre com ícone + texto. A cor nunca é o único sinal. No tema claro esses tons têm 3,2:1 (`#D97706`) e 3,8:1 (`#059669`) sobre branco: servem para **ícones e marcas** (mínimo 3:1), não para texto — o texto ao lado fica em `foreground`/`muted-foreground`. No escuro passam de 7:1.

### Gráficos

Continuam com o par ordinal azul **já validado** na Fase 4 (`--viz-efetiva` / `--viz-bruta`, skill de dataviz). Dados ≠ marca: o azul dos gráficos não precisa seguir o teal.

## 3. Tipografia

*Fonte: par **"Dashboard Data"** do plugin (apareceu no gerador e na busca de tipografia): Fira Sans + Fira Code.*

- **Fira Sans** — todo o texto da interface, inclusive títulos (pesos 400, 500, 600).
- **Fira Code** — números que precisam alinhar ou "ler como dado": cronômetro, horas, contadores, tabelas. A nota do plugin: "Code for data, Sans for labels".
- Adaptação: o plugin põe Fira Code também nos títulos; no Echo os títulos ficam em Fira Sans (mais legível em pt-BR, menos "técnico").
- Corpo 16px, line-height 1.5; nada de texto de corpo abaixo de 12px.
- Hoje o app usa Geist; a troca para Fira entra na fase de revisão (via `next/font/google`, sem `@import`).

**Descartado:** a primeira execução sugeriu Caveat + Quicksand (manuscrita, "blogs pessoais") — ruim para números e tabelas.

## 4. Layout e espaçamento

*Fonte: dials do gerador (densidade 6 = padrão) e regras de layout do plugin.*

- Mobile-first; conferir em 375, 768, 1024 e 1440 px. Nunca rolagem horizontal.
- Escala de espaço de 4 px (Tailwind): 8 entre itens relacionados, 16–24 entre blocos, 32–40 entre seções.
- Largura de leitura: formulários até ~36rem (`max-w-xl`); páginas até `max-w-5xl`.
- Navegação: cabeçalho no PC, barra inferior no celular com **no máximo 5 itens**; o conteúdo não pode ficar escondido atrás de barras fixas (padding equivalente).

## 5. Componentes

- shadcn/ui como base (Button, Input, Card, Badge, NativeSelect, Textarea…), sem estilos soltos com hex direto: sempre tokens.
- Ícones Lucide (SVG). **Nunca emoji como ícone.**
- Listas de itens tocáveis: linha inteira clicável, alvo ≥ 44 px de altura no celular.
- Estados vazios com uma frase do que fazer e o botão para fazer.

## 6. Regras de UX (as que mais pesam no Echo)

*Fonte: domínio `ux` do plugin e tabela de prioridades da skill.*

1. **Acessibilidade (crítico):** contraste de texto ≥ 4,5:1; foco visível em tudo que é clicável; `aria-label` em botões só com ícone; nunca remover o anel de foco.
2. **Toque (crítico):** alvos ≥ 44×44 px no celular (WCAG 2.2 exige no mínimo 24 px na web; usamos 44 para uso com o polegar); 8 px+ entre alvos.
3. **Feedback:** toda ação assíncrona mostra estado (botão "Salvando…", desabilitado); ações de toque rápido (marcar hábito, "me distraí") são **otimistas**, sem esperar o servidor.
4. **Formulários:** rótulo visível (nunca só placeholder); erro perto do campo; campos opcionais recolhidos (divulgação progressiva).
5. **Movimento:** sutil (150–300 ms), no máximo 1–2 elementos animados por tela, e respeitar `prefers-reduced-motion`.
6. **Navegação:** "voltar" previsível; toda tela tem URL própria (deep link).
7. **Gráficos:** legenda quando há 2+ séries, tooltip, tabela alternativa, cor nunca sozinha.
8. **Interação:** `cursor-pointer` em clicáveis; estados de hover com transição.

## 7. Checklist antes de entregar uma tela

- [ ] Sem emoji como ícone (Lucide)
- [ ] Clicáveis com `cursor-pointer` e hover suave (150–300 ms)
- [ ] Contraste 4,5:1 nos dois temas
- [ ] Foco visível para teclado
- [ ] `prefers-reduced-motion` respeitado
- [ ] Responsivo em 375 / 768 / 1024 / 1440 px
- [ ] Alvos de toque ≥ 44 px no celular
- [ ] Cor de estado sempre acompanhada de ícone + texto

---

## Apêndice: saídas brutas do gerador

O padrão de página que o gerador escolheu nas duas execuções ("Product Demo + Features" e "Enterprise Gateway") é de **landing page** e não se aplica a um app logado; foi descartado. Os trechos de animação GSAP de scroll também não se aplicam (o Echo não usa GSAP).

### Execução 1 — "personal productivity habit tracker dashboard"

- Estilo: Minimalism & Swiss Style (claro e escuro).
- Cores: primary `#D97706`, secondary `#F59E0B`, accent `#059669`, background `#FFFBEB`, foreground `#0F172A`, card `#FFFFFF`, muted `#FCF6F0`, muted-fg `#475569`, border `#FAEEE1`, destructive `#DC2626`, ring `#D97706`. Nota: "Streak amber + habit green".
- Tipografia: Caveat + Quicksand ("handwritten, personal… personal blogs").
- Efeitos: hover sutil 200–250 ms, transições suaves, sombras nítidas se houver, hierarquia clara.
- Evitar: cores apagadas, baixa energia.

### Execução 2 — "personal progress tracking dashboard app"

- Estilo: Minimalism & Swiss Style (claro e escuro).
- Cores: primary `#FF4D4D`, secondary `#4D94FF`, accent `#059669`, background `#F5F5F7`, foreground `#1C1C1E`, card `#FFFFFF`, muted `#F2EEF2`, muted-fg `#475569`, border `#E5E5EA`, destructive `#DC2626`, ring `#FF4D4D`. Nota: "Bio red/blue + vitality green" (perfil de saúde).
- Tipografia: Fira Code + Fira Sans ("dashboard, data, analytics").
- Evitar: app de saúde genérico, falta de privacidade.

### Checklist do gerador (igual nas duas)

Sem emoji como ícone · cursor-pointer · hover 150–300 ms · contraste 4,5:1 · foco visível · prefers-reduced-motion · responsivo 375/768/1024/1440.
