---
name: Echo
description: Instrumento diário de prática deliberada; Material 3 em papel quente, areia e teal suave.
colors:
  primary: "#2D6860"
  on-primary: "#FFFAF6"
  primary-container: "#C3E4DD"
  on-primary-container: "#173531"
  secondary-container: "#D4E6E2"
  on-secondary-container: "#394A47"
  tertiary: "#825339"
  tertiary-container: "#FFDBC9"
  on-tertiary-container: "#663C23"
  error: "#984635"
  error-container: "#FFDAD3"
  on-error-container: "#7A2F20"
  surface: "#F8F1E8"
  surface-container-lowest: "#FEF7EE"
  surface-container-low: "#F5EBDC"
  surface-container: "#EFE6D7"
  surface-container-high: "#E9E0D1"
  surface-container-highest: "#E3DACB"
  on-surface: "#2D2A24"
  on-surface-variant: "#514B3D"
  outline: "#7E7667"
  outline-variant: "#CFC5B4"
  inverse-surface: "#38342E"
  inverse-on-surface: "#F4EDE4"
  scrim: "#1A1712"
  terra-salvia: "#426534"
  terra-terracota: "#B05F32"
  terra-ardosia: "#466890"
  terra-mostarda: "#705200"
  terra-ameixa: "#9C6994"
  terra-mar: "#1D6B6A"
  terra-argila: "#9E5251"
  terra-oliva: "#777525"
  viz-efetiva: "#28635C"
  viz-bruta: "#72ABA3"
  viz-calor-1: "#77B0A8"
  viz-calor-2: "#528B83"
  viz-calor-3: "#2D6860"
  viz-calor-4: "#004640"
  sequencia: "#705200"
  concluido: "#426534"
  atrasado: "#984635"
typography:
  display-small:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: "2.75rem"
    letterSpacing: "0"
  headline-large:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: "2.5rem"
    letterSpacing: "0"
  headline-medium:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: "2.25rem"
    letterSpacing: "0"
  headline-small:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: "2rem"
    letterSpacing: "0"
  title-large:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: "1.75rem"
    letterSpacing: "0"
  title-medium:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: "1.5rem"
    letterSpacing: "0.009375rem"
  title-small:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    letterSpacing: "0.00625rem"
  body-large:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
    letterSpacing: "0.03125rem"
  body-medium:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "0.015625rem"
  body-small:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "0.025rem"
  label-large:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    letterSpacing: "0.00625rem"
  label-medium:
    fontFamily: "Roboto Flex, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
    letterSpacing: "0.03125rem"
  numero:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numero-grande:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontWeight: 500
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  2xl: "28px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-filled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-large}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  button-tonal:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    typography: "{typography.label-large}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  button-outlined:
    textColor: "{colors.primary}"
    typography: "{typography.label-large}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  button-text:
    textColor: "{colors.primary}"
    typography: "{typography.label-large}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  button-ghost-icon:
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    size: "40px"
  button-destructive:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-error-container}"
    typography: "{typography.label-large}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  fab-extended:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-large}"
    rounded: "{rounded.lg}"
    padding: "0 20px 0 16px"
    height: "56px"
  card:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-large}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "48px"
  chip:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-large}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "32px"
  chip-selecionado:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    typography: "{typography.label-large}"
    rounded: "{rounded.sm}"
    padding: "0 16px 0 8px"
    height: "32px"
  badge:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-medium}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "24px"
  nav-indicador-ativo:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.full}"
    width: "56px"
    height: "32px"
  navigation-bar:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-medium}"
    height: "64px"
  navigation-rail:
    backgroundColor: "{colors.surface}"
    width: "96px"
  barra-superior:
    backgroundColor: "{colors.surface}"
    height: "64px"
  barra-superior-rolada:
    backgroundColor: "{colors.surface-container}"
    height: "64px"
  dialog:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  menu:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "8px 0"
  snackbar:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.inverse-on-surface}"
    typography: "{typography.body-medium}"
    rounded: "{rounded.sm}"
  tooltip-grafico:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  aba-ativa:
    textColor: "{colors.primary}"
    typography: "{typography.title-small}"
    padding: "0 16px"
    height: "48px"
  comemoracao-nivel:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary-container}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
---

# Design System: Echo

Registro autoritativo do sistema visual **como foi entregue** (etapas 1 a 3 e revisão final, out/2026). Os valores do frontmatter são do **tema claro**, o padrão do app. O tema escuro vem do bloco `.dark` de `src/app/tema.css` e está espelhado em `.impeccable/design.json` (`extensions.temaEscuro`). O guia humano com tabelas e o checklist de entrega é `docs/design-system.md`; quando os dois divergirem, vale este arquivo, porque ele foi derivado do código.

Fontes no código: `src/app/tema.css` (cores `--md-*`, geradas por `scripts/gerar-tema.mjs` via `npm run tema`; não edite à mão), `src/app/globals.css` (mapeamento `@theme`, escala `type-*`, `numero`, `camada-estado`, `opcao`, `segmento`, `shadow-elev-*`, `ease-*`, durações, ripple, entrada do progresso), `src/lib/cores-area.ts` (slots de cor das áreas).

## Overview

**Creative North Star: "O Instrumento Calmo"**

O Echo é um instrumento de uso diário, não uma vitrine: papel quente e areia sob a gramática do Material 3. A tela clara é creme, os contêineres são camadas de areia e bege um pouco mais escuras que o fundo (o inverso do M3 padrão, que levaria o nível mais baixo ao branco), e a tinta é um marrom-acinzentado. A única voz cromática da interface é o teal suave da primária; as cores terrosas existem para identificar áreas e estados, sempre ao lado de um nome.

A densidade é de ferramenta (modo Operate): cartões preenchidos sem borda nem sombra, títulos discretos em peso 400, números em Roboto Mono como dado. A profundidade vem da troca de tom de superfície, não de sombras. O movimento confirma ações e marca conquistas; nada coreografa a abertura de telas, porque o esqueleto de carregamento já faz a continuidade.

A assinatura é o **Eco**: o ripple do M3 vira uma onda de ecolocalização. Todo toque em um elemento com camada de estado solta uma onda a partir do ponto tocado; nas ações que importam (salvar sessão, marcar hábito, concluir meta, subir de nível) a onda vira dois ou três anéis concêntricos. O logo e a tela de login usam as mesmas ondas.

**Key Characteristics:**
- Fundo creme, contêineres em areia, tinta café; nunca branco nem preto puros na interface.
- Primária teal suave como único acento de interface; terrosas só para áreas e estados.
- Elevação tonal; sombras raras, suaves e com deslocamento.
- Formas generosas: botões em pílula, cartões de 16px, dialogs de 28px.
- Números em Roboto Mono tabular; texto em Roboto Flex.
- Movimento M3 (Motion por padrão, GSAP só na comemoração de nível), sempre em paralelo à ação.

## Colors

Uma paleta Material 3 Tonal Spot gerada de duas sementes (teal `#2F7D74` com croma reduzido e areia `#E8DFD0` como neutro), mais oito tons terrosos para áreas e uma rampa teal de uma matiz para gráficos.

### Primary
- **Teal Suave** (`primary`): botão preenchido, texto de botões outlined e text, aba ativa, anel de foco, cursor de texto e `accent-color`. Contraste de 5,8:1 sobre o fundo claro.
- **Creme Sobre Teal** (`on-primary`): texto sobre a primária. É creme, não branco.
- **Teal Névoa** (`primary-container` / `on-primary-container`): FAB, badge padrão, seleção de texto, disco do logo no login.

### Secondary
- **Verde-Água Tonal** (`secondary-container` / `on-secondary-container`): indicador ativo da navegação, chip e segmento selecionados, cartão de opção marcado, botão tonal, trilho do progresso, avisos informativos em bloco.

### Tertiary
- **Terracota Suave** (`tertiary`, `tertiary-container` / `on-tertiary-container`): reservada à comemoração de novo nível. É o único cartão do app em terracota, e isso marca a raridade do momento.

### Neutral
- **Creme** (`surface`): fundo de página, navigation rail e barra superior em repouso.
- **Creme Claro** (`surface-container-lowest`): fundo dos campos.
- **Areia** (`surface-container-low`): cartões.
- **Areia Média** (`surface-container`): navigation bar, menus, barra superior depois de rolar, rodapé de cartão.
- **Areia Funda** (`surface-container-high`): dialogs, blocos de esqueleto.
- **Bege** (`surface-container-highest`): tooltip de gráfico, trilho do switch desligado, célula vazia do heatmap.
- **Tinta Café** (`on-surface`): texto principal (12,8:1).
- **Café Médio** (`on-surface-variant`): texto secundário, ícones de navegação inativos, rótulos de eixo (7,7:1).
- **Contorno** (`outline`): borda de campo, segmento e botão outlined; eixos de gráfico.
- **Divisória** (`outline-variant`): chip desmarcado, cartão de opção, linha das abas, grade dos gráficos, barra de rolagem.
- **Café Inverso** (`inverse-surface` / `inverse-on-surface`): snackbar.
- **Scrim** (`scrim`): atrás de dialogs, a 32% de opacidade, sem desfoque.

### Terrosas (áreas e estados)
- **Sálvia, Terracota, Ardósia, Mostarda, Ameixa, Mar, Argila, Oliva** (`terra-*`): uma por área, nessa ordem de atribuição (vizinhos com matiz oposta e luminosidade alternada). Cada slot tem uma versão `-suave` usada como fundo de ícone e chip de área. O banco guarda um hex por área; `cores-area.ts` converte cada hex conhecido (paleta nova e legada) em `var(--md-terra-*)`, para a cor acompanhar o tema. Hex desconhecido aparece como foi gravado.
- **Estados:** `concluido` = Sálvia, `sequencia` = Mostarda, `atrasado` = `error`.

### Visualização
- **Efetiva / Bruta** (`viz-efetiva`, `viz-bruta`): o par de séries de horas.
- **Calor 1 a 4** (`viz-calor-*`): rampa ordinal do heatmap, de pouco a muito. No escuro a rampa inverte (do escuro para o claro).
- Grade em `outline-variant`, eixos em `outline`, rótulos em `on-surface-variant`.

### Named Rules
**The Paper Rule.** Nenhuma superfície, tinta ou texto da interface é `#FFF` ou `#000`. Toda cor vem de um token `--md-*`; hex solto só existe em `tema.css` (gerado) e no `themeColor` do viewport.

**The Name Beside Color Rule.** Cor terrosa nunca é texto e nunca é o único sinal: a área aparece sempre com o nome; o estado, com ícone e texto. Algumas terrosas ficam entre 3,8 e 4,5:1 no claro, o que serve para gráfico e não para texto.

**The One Hue Chart Rule.** Gráficos usam só a rampa teal (`viz-*`). Cores de área nunca são séries, porque o conjunto terroso reprova como paleta categórica.

## Typography

**Display Font:** Roboto Flex (com ui-sans-serif, system-ui)
**Body Font:** Roboto Flex (com ui-sans-serif, system-ui)
**Label/Mono Font:** Roboto Mono (com ui-monospace), só para números

**Character:** Uma sans humanista e neutra em pesos baixos, com títulos em 400, e uma mono tabular que transforma horas e contagens em dado legível. A unidade ("h", "kg") fica em Roboto ao lado do número em Mono.

### Hierarchy
- **Display Small** (400, 36/44): números de destaque. Raro.
- **Headline Medium / Small** (400, 28/36 · 24/32): título da página, médio no PC e pequeno no celular; título de dialog e nome do nível na comemoração em Small.
- **Title Large** (400, 22/28): títulos de seção, título do cartão de login.
- **Title Medium / Small** (500, 16/24 · 14/20): títulos de cartão e de lista; Small também nas abas e no título do tooltip.
- **Body Large** (400, 16/24): corpo padrão do `body` e texto dos campos.
- **Body Medium / Small** (400, 14/20 · 12/16): texto secundário, descrições, legendas, texto de cartão e de dialog. É o estilo mais usado do app.
- **Label Large / Medium** (500, 14/20 · 12/16): botões, chips, FAB, itens de menu; Medium nos rótulos da navegação e nos badges.
- **Número** (Roboto Mono, tabular, -0.02em) e **Número Grande** (Mono 500, -0.04em): horas, cronômetro, contagens, eixos numéricos dos gráficos.

### Named Rules
**The Mono For Data Rule.** Todo número que é dado (horas, minutos, contagem, valor de métrica) usa `numero` ou `numero-grande`; texto corrido nunca usa Mono.

**The Quiet Headline Rule.** Títulos ficam em peso 400. A hierarquia vem de tamanho e tom (`on-surface` contra `on-surface-variant`), não de negrito. O único semibold do sistema é o rótulo do destino ativo na navegação.

**The 12px Floor Rule.** Nenhum texto abaixo de 12px (`body-small` / `label-medium`).

## Layout

Mobile-first, coluna única de conteúdo com até `max-w-5xl` (1024px), margens de 16px no celular e 32px a partir de 768px (`md`). No PC o navigation rail fixo ocupa 96px à esquerda e o conteúdo começa depois dele; no celular a navigation bar fixa embaixo e o FAB estendido acima dela (88px do fundo mais a área segura), com 160px de folga no fim do conteúdo. A barra superior tem 64px e fica grudada no topo.

Ritmo em grade de 4px: 8px entre itens relacionados (o `gap-2` é de longe o mais usado), 12 a 16px dentro de grupos, 24 a 32px entre blocos, e o cabeçalho de página separa 32px do conteúdo. Cartões respiram 20px (12px na variante pequena), dialogs 24px.

O cabeçalho de página (`PageHeader`) carrega o título da tela dentro do conteúdo, não na barra superior: voltar opcional como botão de texto, título, descrição em `on-surface-variant` e ações alinhadas à direita, quebrando linha quando falta espaço.

Toda rota logada tem um `loading.tsx` com `EsqueletoPagina`: o título real já aparece, e o resto são blocos em `surface-container-high` no formato da tela (painel, lista, cartões, formulário, detalhe, checklist). O heatmap mostra 26 semanas no celular e 53 a partir de `md`.

Conferir em 375/390, 768, 1024 e 1440px, sem rolagem horizontal.

## Elevation & Depth

Elevação tonal primeiro. A camada vem da troca de superfície: `surface` no fundo, `surface-container-low` nos cartões, `surface-container` na barra de navegação e nos menus, `surface-container-high` nos dialogs. A barra superior não ganha sombra ao rolar; ela muda de `surface` para `surface-container` (300ms, curva padrão).

### Shadow Vocabulary
Três sombras M3 suaves, com deslocamento, tingidas pela cor `shadow` do tema (valores exatos no sidecar):
- **Elev 1**: hover dos botões preenchido e tonal; FAB de ícone no rail.
- **Elev 2**: menus, tooltip de gráfico.
- **Elev 3**: FAB estendido no celular, dialogs, snackbar.

### Named Rules
**The Tone Before Shadow Rule.** Para separar uma camada, troque o tom de superfície. Sombra só para o que flutua sobre o conteúdo (FAB, menu, dialog, snackbar, tooltip) e como resposta de hover. Nada de brilho colorido nem sombra dura.

## Shapes

Forma generosa e arredondada, escala M3 um pouco ampliada:
- **Pílula** (9999px): todos os botões, indicador ativo da navegação, switch, segmentos nas pontas, anéis do Eco, contagem nas abas.
- **8px**: chips, badges, snackbar.
- **12px**: campos, menus, tooltip, cartão de opção, blocos de esqueleto.
- **16px**: cartões, FAB, comemoração de nível, blocos de aviso.
- **28px**: dialogs e cartão de login.

Dentro de gráficos os raios são menores, para não deformar o dado: 4px no topo das barras e 3px nas células do heatmap.

Bordas são de 1px e funcionais: `outline` onde a borda delimita uma entrada (campo, segmento, botão outlined) e `outline-variant` onde ela só divide (chip, abas, opção, rodapé de cartão). Cartões não têm borda.

## Components

### Buttons
Pílulas táteis e calmas, todas com camada de estado e ripple Eco.
- **Shape:** pílula completa; altura de 40px (32 no `sm`, 48 no `lg`, 40×40 no ícone). Em telas de toque (`pointer: coarse`) o alvo sobe para 44px sem mudar o visual no PC.
- **Filled** (padrão): `primary` com texto `on-primary`, 24px de lado (16px do lado do ícone).
- **Tonal** (`secondary`): `secondary-container`.
- **Outlined:** borda `outline`, texto `primary`.
- **Text:** só texto `primary`; usado no "voltar" do cabeçalho e nas ações de dialog.
- **Ghost:** ícones e ações neutras em `on-surface-variant` (sair, alternar tema).
- **Destructive:** `error-container`.
- **Hover / Focus:** camada de estado na cor do texto (8% no hover só com mouse, 10% no foco e ao pressionar); preenchido e tonal ganham Elev 1 no hover. Foco com contorno de 2px em `primary`, 2px afastado. Desabilitado a 40% de opacidade.

### Chips
- **Style:** 32px de altura (44 no toque), 8px de raio, `label-large`.
- **State:** desmarcado com borda `outline-variant` e texto `on-surface-variant`; selecionado em `secondary-container`, sem borda e com check à esquerda. Expõe `aria-pressed`.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** `surface-container-low`, texto `body-medium`.
- **Shadow Strategy:** nenhuma (ver Elevation & Depth).
- **Border:** nenhuma; o rodapé opcional é `surface-container` com divisória `outline-variant` no topo.
- **Internal Padding:** 20px (12px no tamanho pequeno).
- **Cartão de opção** (`opcao`): contorno `outline-variant`, 12px; marcado vira tonal `secondary-container` sem borda.

### Inputs / Fields
- **Style:** outlined, 48px de altura, 12px de raio, fundo `surface-container-lowest`, borda `outline`, texto `body-large`, 16px de lado. Textarea cresce com o conteúdo a partir de 96px. Select nativo com chevron em `on-surface-variant`.
- **Focus:** borda `primary` engrossada para 2px por sombra interna de 1px, sem deslocar o layout. Hover escurece a borda para `on-surface`.
- **Error / Disabled:** erro com borda `error` de 2px (mesma técnica) e mensagem perto do campo; desabilitado a 40%.
- **Rótulo:** sempre visível acima do campo, nunca só placeholder.

### Navigation
- **Celular:** navigation bar fixa embaixo em `surface-container`, com 4 itens: Início, Hábitos, Áreas e Mais. O FAB estendido "Registrar" fica acima dela, à direita, e encolhe e some nas telas de registro e timer.
- **PC (≥768px):** navigation rail de 96px em `surface`, com marca, FAB de ícone (Elev 1), os mesmos 3 destinos e "Mais" como menu lateral em `surface-container` (itens de 48px, Elev 2).
- **Destino:** ícone Lucide de 24px dentro de um indicador de 56×32 e rótulo `label-medium` embaixo. Ativo: a pílula `secondary-container` abre do centro para os lados (300ms, desaceleração enfatizada), o ícone engrossa o traço (2,25 contra 1,75) e o rótulo vai para semibold em `on-surface`. O destaque é otimista: muda no clique, antes da nova tela chegar.
- **Abas primárias:** links de 48px em `title-small`; ativa em `primary` com sublinhado de 3px arredondado em cima; contagem em pílula Mono.
- **Barra superior:** 64px; logo no celular; chip do timer ativo, alternar tema e sair à direita.

### Feedback e overlays
- **Dialog / AlertDialog:** `surface-container-high`, 28px, 24px de respiro, Elev 3, título em `headline-small`, scrim a 32%. Entra em 300ms com desaceleração enfatizada e sai em 150ms com aceleração enfatizada.
- **Menu:** `surface-container`, 12px, Elev 2, 8px de respiro vertical.
- **Snackbar** (Sonner): `inverse-surface`, 8px, Elev 3, embaixo e ao centro, ícones Lucide.
- **Badge:** 24px, 8px, `label-medium`, em contêiner tonal.
- **Progresso:** linear M3 de 6px; preenchimento `primary` arredondado, vão de 4px até o trilho `secondary-container` e ponto de parada no fim. Ao aparecer, o preenchimento cresce do início (700ms).
- **Switch:** trilho 52×32; desligado com contorno `outline` e polegar de 16px; ligado em `primary` com polegar `on-primary` de 24px.
- **Segmentado** (`segmento`): grupo em pílula com borda `outline`, 40px (44 no toque); selecionado em `secondary-container`.

### Gráficos
- **Barras de horas:** efetivas em `viz-efetiva` sólido; brutas com listras a 45° (`viz-efetiva` sobre `viz-bruta`) e contorno de 1px em `viz-efetiva`, o que garante 3:1 sobre o cartão sem depender só da cor. As chaves do tooltip repetem a legenda (listrada e sólida).
- **Linha e radar:** traço de 2px em `viz-efetiva`, pontos com anel na cor do cartão; meta como linha tracejada em `on-surface-variant`.
- **Heatmap:** nível 0 em `surface-container-highest`, níveis 1 a 4 em `viz-calor-1…4`; o nível 1 ganha um anel interno de 1px em `viz-calor-2` porque sozinho fica abaixo de 3:1. A grade é `role="img"` com resumo em `aria-label`, e a legenda tem o nome de cada faixa.
- **Tooltip:** `surface-container-highest`, 12px, Elev 2, título `title-small`, valores em Mono.
- Gráficos não animam a entrada; legenda quando há 2 ou mais séries.

### Eco (Signature Component)
- **Ripple Eco:** um listener global (`EcoRipple`) em `pointerdown` solta uma onda circular na cor do texto (14% de opacidade) a partir do ponto tocado, em qualquer elemento com `camada-estado`; 450ms com desaceleração. Não intercepta o clique.
- **Anéis Eco** (`EcoAneis`, `ecoNaTela`): três anéis de 2px que crescem de 0,6–0,7× até cerca de 2,5× e somem, 1,1s, 160ms entre eles, em `concluido` (Sálvia) nas três confirmações entregues: sessão salva, dia de hábitos completo e meta concluída. O padrão do componente é `primary`. `ecoNaTela` serve quando a origem sai da tela, como a meta concluída que deixa a lista.
- **Comemoração de nível:** cartão `tertiary-container` com troféu num disco invertido; abre do centro, três anéis em ondas, o nome do nível sobe. É o único uso de GSAP, importado só nesse momento; o cartão é visível sem o GSAP.

### Movimento
- Tokens: curvas `ease-standard` (0.2, 0, 0, 1), `ease-emphasized-decelerate` (0.05, 0.7, 0.1, 1), `ease-emphasized-accelerate` (0.3, 0, 0.8, 0.15) e durações de 100 a 500ms. Motion recebe as mesmas curvas em `EASE`.
- Infra: `MotionConfig reducedMotion="user"` e `LazyMotion` só com `domAnimation` (componentes `m.*`).
- Feedback de 100 a 300ms, entrada de overlay em 300ms, comemoração até cerca de 1,6s. Saída mais rápida que entrada. A tabela de momentos está na seção 7 de `docs/design-system.md`.

## Do's and Don'ts

### Do:
- **Do** use só tokens do tema (`--md-*` e as classes do `@theme`); para mudar a paleta, edite as sementes em `scripts/gerar-tema.mjs` e rode `npm run tema`.
- **Do** separe camadas por tom de superfície: cartão em `surface-container-low` sobre `surface`, dialog em `surface-container-high`.
- **Do** ponha `camada-estado` em todo elemento interativo, com foco de 2px em `primary` afastado 2px.
- **Do** garanta 44px de alvo em `pointer: coarse` e 8px ou mais entre alvos.
- **Do** mantenha 4,5:1 para texto e 3:1 para elementos gráficos nos dois temas; quando um tom de gráfico não chega a 3:1, adicione contorno ou textura (como as barras brutas e o nível 1 do heatmap).
- **Do** escreva números em `numero`/`numero-grande` e a unidade em Roboto ao lado.
- **Do** dê a toda rota nova um `loading.tsx` com `EsqueletoPagina` no formato da tela, e busque os dados em paralelo.
- **Do** rode toda animação em paralelo à ação e respeite `prefers-reduced-motion` (sem movimento espacial, no máximo um fade curto).
- **Do** use Motion (`m.*`) para animação de interface; GSAP só quando Motion não servir, importado sob demanda na tela que o usa.
- **Do** mostre sempre o nome da área junto da cor dela, e ícone mais texto junto da cor de estado.

### Don't:
- **Don't** use `#FFF`, `#000`, branco ou preto puros em superfície, texto ou ícone.
- **Don't** use cor terrosa como texto nem como série de gráfico.
- **Don't** ponha mais de 5 itens na navigation bar.
- **Don't** use emoji como ícone; ícones são Lucide de traço único.
- **Don't** faça uma ação (salvar, marcar, navegar) esperar uma animação terminar.
- **Don't** adicione sombra a cartões nem sombra dura ou brilho colorido em qualquer lugar.
- **Don't** coreografe a abertura de telas; o esqueleto já faz a continuidade.
- **Don't** use placeholder no lugar de rótulo visível.
- **Don't** use `@material/web`; o M3 é implementado em Tailwind e shadcn/ui sobre Base UI.
