# Echo — Design System

**Direção (out/2026):** Material Design 3 como linguagem, com paleta **quente** (creme, areia, café) e primária **teal suave**. Implementado nos componentes do projeto (Tailwind CSS 4 + shadcn/ui sobre Base UI). **Não** usamos `@material/web`, que está em modo de manutenção e é baseado em web components.

Sensação: clara, quente e acolhedora, confortável para uso diário. Nunca branco puro nem preto puro.

Este documento substitui a versão anterior, gerada com o ui-ux-pro-max (Minimalism & Swiss, Fira Sans/Code, paleta "Productivity Tool"). Dessa versão continuam valendo as **regras de UX** (seção 9). Paleta, tipografia e estilo foram substituídos.

Fontes da verdade no código:

| O quê | Onde |
|---|---|
| Esquema de cores (gerado) | [src/app/tema.css](../src/app/tema.css), por [scripts/gerar-tema.mjs](../scripts/gerar-tema.mjs) (`npm run tema`) |
| Tokens do Tailwind, tipografia, forma, elevação, movimento, camada de estado | [src/app/globals.css](../src/app/globals.css) |
| Componentes base | [src/components/ui/](../src/components/ui/) |
| Cores das áreas | [src/lib/cores-area.ts](../src/lib/cores-area.ts) |

---

## 1. Cor

### Como é gerada

O `@material/material-color-utilities` (`DynamicScheme`, variante Tonal Spot) recebe duas fontes:

- **Primária:** teal `#2F7D74`, com croma levemente reduzido (28) para containers calmos.
- **Neutro quente:** areia `#E8DFD0`, no lugar do neutro padrão. O fundo e a tinta usam croma 4 (as referências creme e café têm croma entre 2,4 e 3,7). Os containers usam a própria areia (croma 6,6 no claro e 5 no escuro).

As superfícies seguem a direção do Echo, não o padrão M3. No tema claro, os containers são **um pouco mais escuros** que o fundo, o que cria camadas de areia e bege. O padrão M3 faz o inverso, e o nível mais baixo dele seria branco puro.

Para mudar a paleta, edite as fontes no script e rode `npm run tema`. O relatório imprime os contrastes de todos os pares.

### Paleta principal

| Papel (token `--md-*`) | Claro | Escuro |
|---|---|---|
| `surface` / `background` | `#F8F1E8` creme | `#1D1A15` café |
| `surface-container-lowest` (campos) | `#FEF7EE` | `#17140F` |
| `surface-container-low` (cartões) | `#F5EBDC` areia | `#232019` |
| `surface-container` (barra de navegação, menus) | `#EFE6D7` | `#29251E` |
| `surface-container-high` (dialogs) | `#E9E0D1` | `#302D25` |
| `surface-container-highest` | `#E3DACB` bege | `#39352E` |
| `on-surface` (texto) | `#2D2A24` | `#EBE4DB` creme |
| `on-surface-variant` (texto secundário) | 7,7:1 sobre o fundo | 9,6:1 sobre o fundo |
| `outline` / `outline-variant` | bordas de campo / divisórias | idem |
| `primary` | `#2D6860` | `#97D2C9` |
| `on-primary` | `#FFFAF6` (creme, não branco) | `#003732` |
| `primary-container` | `#C3E4DD` | `#2F4C48` |
| `on-primary-container` | `#173531` | `#C8E9E3` |
| `secondary-container` (indicador ativo, chips selecionados) | `#D4E6E2` | `#394A47` |
| `tertiary` (terracota suave) | `#825339` | `#F6B998` |
| `error` | `#984635` | `#FFB4A5` |
| `inverse-surface` (snackbar) | escuro quente | creme |

**Contraste (todos medidos):**
- Texto principal: 12,8:1 no claro e 13,8:1 no escuro.
- Primária sobre o fundo: 5,8:1 no claro e 10,2:1 no escuro.
- Todos os pares "on-X sobre X" ficam acima de 6:1.

### Cores terrosas (áreas e estados)

Ordem de atribuição: vizinhos têm matizes opostas e luminosidade alternada.

| Slot | Claro | Escuro | Uso |
|---|---|---|---|
| Sálvia | `#426534` | `#A4CC91` | áreas · **concluído** |
| Terracota | `#B05F32` | `#EC8E5E` | áreas |
| Ardósia (azul acinzentado) | `#466890` | `#97B9E5` | áreas |
| Mostarda | `#705200` | `#F2BF4E` | áreas · **sequência** |
| Ameixa | `#9C6994` | `#C68FBC` | áreas |
| Mar | `#1D6B6A` | `#81C8C6` | áreas |
| Argila (rosa) | `#9E5251` | `#F69A98` | áreas |
| Oliva | `#777525` | `#AEAC56` | áreas |

- Todas ficam acima de **3:1** sobre o fundo e todos os containers, nos dois temas (requisito para elementos gráficos).
- **Nunca são usadas como texto.** No claro, algumas ficam entre 3,8 e 4,5:1, abaixo do mínimo para texto. O texto ao lado fica em `on-surface`/`on-surface-variant`.
- Cada slot tem uma versão `-suave`, usada como fundo de ícones e chips de área.
- **Atrasado** usa `error`.
- O validador de paletas da skill de dataviz **reprova este conjunto como série categórica de gráfico**: são tons suaves, de luminosidade parecida, e alguns pares ficam próximos para daltônicos. Por isso a regra é:
  - A cor de área sempre aparece junto do **nome** da área. Essa é a codificação secundária.
  - Os gráficos **não** usam essas cores como séries.
- **Calendário** (blocos e sessões): fundo `-suave` da área, texto sempre em `on-surface` (8,5:1 ou mais em todos os slots, nos dois temas) e borda na cor da área (3:1 ou mais sobre o cartão). Não é gráfico: cada bloco leva o nome da habilidade (ou a sigla, na semana compacta do celular, com o nome no rótulo acessível e nos detalhes). Planejado × feito não depende da cor: borda **tracejada** = planejado, borda lateral **cheia** = feito. A visão Mês usa a rampa `viz-calor` (um tom só) para a intensidade das horas, nunca cores de área.
- **Áreas existentes:** o banco guarda um hex por área. O [cores-area.ts](../src/lib/cores-area.ts) converte cada hex conhecido (da paleta antiga e da nova) para o token do tema, então a cor acompanha o claro e o escuro sem mudar dados. Uma cor personalizada (hex desconhecido) aparece como foi gravada.

### Gráficos

Rampas tiradas da própria paleta da primária: uma matiz, do claro para o escuro, validadas como ordinais nos dois temas (skill de dataviz):

| Token | Claro | Escuro |
|---|---|---|
| `--md-viz-efetiva` / `--md-viz-bruta` (par efetivas × brutas) | `#28635C` / `#72ABA3` | `#97D2C9` / `#28635C` |
| `--md-viz-calor-1…4` (heatmap, pouco → muito) | `#77B0A8` → `#004640` | `#256059` → `#9DD7CE` |

Grade em `outline-variant`, eixos em `outline` e rótulos em `on-surface-variant`.

## 2. Tipografia

- **Roboto Flex** em todo o texto. **Roboto Mono** em números, horas e cronômetro (utilitário `numero`; `numero-grande` em números de destaque). Unidades como "h" e "kg" ficam em Roboto, ao lado do número em Mono.
- Escala M3 como utilitários `type-*`:

| Utilitário | Tamanho/linha | Peso | Uso |
|---|---|---|---|
| `type-display-small` | 36/44 | 400 | números de destaque |
| `type-headline-medium` / `-small` | 28/36 · 24/32 | 400 | título da página (PC / celular) |
| `type-title-large` | 22/28 | 400 | títulos de seção, marca |
| `type-title-medium` / `-small` | 16/24 · 14/20 | 500 | títulos de cartão e de lista |
| `type-body-large` | 16/24 | 400 | texto padrão (corpo) |
| `type-body-medium` / `-small` | 14/20 · 12/16 | 400 | texto secundário, legendas |
| `type-label-large` / `-medium` | 14/20 · 12/16 | 500 | botões, chips, navegação |

Nada de texto de corpo abaixo de 12px.

## 3. Forma

Escala M3, um pouco mais generosa:

| Raio | Uso |
|---|---|
| `rounded-xs` 4px | — |
| `rounded-sm` 8px | chips, snackbar, badges |
| `rounded-md` 12px | campos, menus, ícones de área |
| `rounded-lg` 16px | cartões, FAB |
| `rounded-2xl` 28px | dialogs, cartão de login |
| `rounded-full` | botões, indicadores de navegação, switch |

## 4. Elevação

**Tonal primeiro:** a camada vem da troca de superfície (`surface`, `surface-container-low`, `surface-container`, `surface-container-high`). Sombra é rara e sempre suave, com deslocamento: `shadow-elev-1` (hover de botão), `shadow-elev-2` (menus) e `shadow-elev-3` (FAB, dialogs, snackbar). Nada de brilho colorido nem de sombra dura.

A barra superior fica sobre `surface` e muda para `surface-container` ao rolar a página, em vez de ganhar sombra.

## 5. Estados e ripple "Eco"

- **Camada de estado M3** (`camada-estado`): sobreposição na cor do texto, com 8% no hover (só em dispositivos com mouse) e 10% no foco e ao pressionar.
- **Foco:** contorno de 2px em `primary`, com 2px de afastamento, em todo elemento focável.
- **Ripple "Eco", o movimento assinatura do Echo:** ao tocar em qualquer elemento com camada de estado, uma onda se expande do ponto tocado e some (450ms, desaceleração). É um único listener global em [eco-ripple.tsx](../src/components/eco-ripple.tsx). Não bloqueia o clique e não roda com `prefers-reduced-motion`. Nas ações que importam (salvar sessão, marcar hábito, concluir meta, subir de nível), o eco vira um pulso de 2 a 3 anéis concêntricos (etapa de animações). O logo e a tela de login usam as mesmas ondas.
- **Superfícies do navegador** também seguem o tema: seleção de texto em `primary-container`, cursor de texto em `primary`, barra de rolagem em `outline-variant` e `accent-color` em `primary`.

## 6. Componentes

| Componente | Especificação |
|---|---|
| **Botões** (`Button`, `buttonVariants`) | pílula, 40px, `type-label-large`. Variantes: `default` = filled (primary), `secondary` = tonal (secondary-container), `outline` = outlined (borda outline, texto primary), `text` (texto primary), `ghost` = padrão para ícones (on-surface-variant), `destructive` (error-container). Tamanhos `sm` 32, `lg` 48, `icon` 40. Em telas de toque: mínimo de 44px. |
| **FAB** (`fabVariants`) | primary-container, 16px de raio. Estendido no celular ("Registrar", acima da barra de navegação, `shadow-elev-3`); só ícone no topo do rail no PC, com `shadow-elev-1` (fica sobre a superfície, não sobre conteúdo). |
| **Navegação** | Celular: *navigation bar* com 4 destinos (Início, Hábitos, Áreas, Mais) mais o FAB "Registrar". PC (≥768px): *navigation rail* fixo à esquerda (marca, FAB, destinos e "Mais" como menu). Indicador ativo: pílula 56×32 em secondary-container. |
| **Barra superior** | 64px. No celular: marca. Nos dois: chip do timer ativo, alternar tema, sair. |
| **Cartões** (`Card`) | filled: `surface-container-low`, 16px de raio, 20px de respiro, sem borda nem sombra. |
| **Campos** (`Input`, `Textarea`, `NativeSelect`) | outlined: 48px, 12px de raio, fundo `surface-container-lowest`, borda `outline`; no foco, borda `primary` de 2px sem deslocar o layout. Rótulo sempre visível acima (`type-label-large`). |
| **Chips** (`Chip`, `chipVariants`) | 32px, 8px de raio. Desmarcado: borda `outline-variant`. Selecionado: `secondary-container` com check. |
| **Switch** | trilho 52×32. Desligado: contorno com polegar de 16px. Ligado: primary com polegar de 24px. |
| **Dialogs** (`Dialog`, `AlertDialog`) | `surface-container-high`, 28px de raio, 24px de respiro, título em `type-headline-small`, ações em botões de texto à direita, scrim do tema (sem desfoque). |
| **Menus** (`DropdownMenu`, menu do rail) | `surface-container`, 12px de raio, `shadow-elev-2`, itens de 44 a 48px. |
| **Progresso** (`Progresso`) | linear M3: preenchimento primary, vão de 4px, trilho `secondary-container` e ponto de parada no fim. |
| **Snackbar** (toasts) | `inverse-surface`, 8px de raio, embaixo e ao centro. |
| **Badges** | 24px, 8px de raio, `type-label-medium`, em container tonal. |
| **Ícones** | Lucide, traço único. Nunca emoji. |

## 7. Movimento

Tokens M3 em [globals.css](../src/app/globals.css). Curvas `ease-standard` (0.2, 0, 0, 1), `ease-emphasized-decelerate` (0.05, 0.7, 0.1, 1) e `ease-emphasized-accelerate` (0.3, 0, 0.8, 0.15). Durações `--md-dur-short2…long2` (100 a 500ms).

- **Motion** é o padrão para animações de interface.
- **GSAP** só onde Motion não serve bem, e só carregado nas telas que o usam.
- Tudo respeita `prefers-reduced-motion` (sem animação ou só um fade curto).
- Nenhuma ação espera uma animação terminar.

**Tese.** O Echo é uma ferramenta (modo Operate): movimento confirma ações, explica mudanças de estado e marca conquistas. Nada de coreografia na abertura das telas — o esqueleto de carregamento já faz a continuidade.

**Infra.** [movimento.tsx](../src/components/movimento.tsx) envolve o app em `MotionConfig reducedMotion="user"` + `LazyMotion` (só `domAnimation`, componentes `m.*` de `motion/react-m`). As curvas M3 ficam em `EASE`.

**Assinatura "Eco"** ([eco.tsx](../src/components/eco.tsx)): três anéis que se expandem e somem a partir de onde algo importante aconteceu. Nas confirmações de conquista os anéis usam `--concluido` (sálvia); o padrão do componente é `primary`. `EcoAneis` (dentro de um pai `relative`) ou `ecoNaTela(rect)` (quando a origem sai da tela). Somem com reduced motion; a confirmação em si continua.

| Momento | O que acontece | Onde |
|---|---|---|
| Sessão salva | Ícone entra com mola, check se desenha, eco verde | registro-form |
| Novo nível | Cartão abre do centro, ondas de eco, troféu e nome do nível sobem (GSAP, importado só nesse momento) | registrar/comemoracao-nivel |
| Meta concluída | Eco a partir do botão Concluir + aviso | ConfirmButton `comemorar` |
| Dia de hábitos completo | Selo "Dia completo" entra com eco | habitos/checklist |
| Marcar hábito | Círculo pulsa, check se desenha (só nos marcados na visita) | habitos/checklist |
| Navegação | Pílula do destino ativo abre do centro; FAB encolhe/volta ao entrar/sair de Registrar | nav |
| Barras de progresso | Preenchimento cresce do início ao aparecer | globals.css |
| Dialogs | Entrada 300ms desacelerando, saída 150ms acelerando | ui/dialog, ui/alert-dialog |
| Timer | Ponto "Contando" pulsando (para ao pausar); contador de distrações salta; modo foco com fade | timer-painel |

Durações: feedback 100–300ms, entradas de overlay 300ms, comemoração até ~1,6s (sempre em paralelo, nunca bloqueando). Saída mais rápida que entrada.

## 8. Layout

- **Mobile-first.** Conferir em 375/390, 768, 1024 e 1440px. Sem rolagem horizontal.
- **Conteúdo:** até `max-w-5xl`, com 16px de margem no celular e 32px no PC. No PC, o conteúdo começa depois do rail (96px).
- **Espaço:** grade de 4px. 8px entre itens relacionados, 16 a 24px entre blocos e 32 a 40px entre seções, com mais espaço acima de um título do que abaixo.
- **Rodapé no celular:** o conteúdo tem margem inferior suficiente para a barra de navegação (80px) e o FAB.

## 9. Regras de UX (mantidas)

1. **Contraste:** 4,5:1 para texto e 3:1 para elementos gráficos, nos dois temas.
2. **Foco** visível em tudo que é clicável. `aria-label` em botões só com ícone.
3. **Alvos de toque** de 44px no celular (`pointer-coarse`). 8px ou mais entre alvos.
4. **Feedback:** toda ação assíncrona mostra estado. Ações rápidas (marcar hábito, "me distraí") são otimistas.
5. **Formulários:** rótulo visível, erro perto do campo, campos opcionais recolhidos.
6. **Navegação:** barra inferior com no máximo 5 itens, "voltar" previsível, URL própria para cada tela.
7. **Gráficos:** legenda quando há 2 ou mais séries, tooltip, tabela alternativa e cor nunca como único sinal.
8. **Cor de estado** sempre com ícone e texto.

## Checklist antes de entregar uma tela

- [ ] Só tokens do tema: nada de hex solto, branco ou preto puros
- [ ] Contraste conferido no claro **e** no escuro
- [ ] Escala tipográfica `type-*`; números em `numero`
- [ ] Interativos com `camada-estado` (ripple), foco visível e 44px no toque
- [ ] Sem emoji como ícone
- [ ] Responsivo em 390 / 768 / 1440px
- [ ] `prefers-reduced-motion` respeitado
