---
version: 1
slug: "src-app-app-layout-tsx"
primary_target: "src/app/(app)/layout.tsx"
related_targets: ["src/app/login/page.tsx","src/app/globals.css"]
---

# Echo — app shell (todas as telas logadas + login)

Mode: Operate. Single user, daily: PC plans/reviews, phone logs in seconds.

## Direction contract

THESIS: Echo is a calm daily instrument for deliberate practice; the interface feels like warm paper and sand under Material 3's grammar. It refuses the default grey-SaaS dashboard (white cards on white, one blue accent) and the gamified streak-app look.

OWN-WORLD: Material 3 tonal system from two seeds — primary soft teal (~#2F7D74) and a warm sand neutral (~#E8DFD0). Light: cream ground (~#F7F2EA), sand/beige surface-container tiers for layering, ink brown-grey (~#2E2A25); never #FFF/#000. Dark: warm coffee (~#1C1A17), brown-grey containers, cream ink. Earthy accent family (sage, terracotta, mustard, slate blue, plum) for areas and states; charts use a single teal ramp (area colors never become series or text). Roboto Flex text, Roboto Mono for hours/timer. Generous rounded shapes, tonal elevation over shadows, M3 state layers and ripple.

STORY: The user sees today first (habits, what to log), logs without friction, and reads where they are evolving vs neglecting.

FIRST VIEWPORT: Desktop: navigation rail left (FAB "Registrar" atop; Início, Hábitos, Áreas, Mais), content column on cream with sand containers; top bar holds active timer chip, theme toggle and sign-out, the page title lives in PageHeader at the top of the content. Phone: top app bar with the logo, content, extended FAB above a 4-item navigation bar (Início, Hábitos, Áreas, Mais). (Updated at the final audit to match the approved build.) Login: single sand card centered on cream, echo mark.

FORM: Material 3 (brief-pinned). Signature move: "Eco" — the M3 ripple becomes an echolocation pulse: on meaningful actions (save session, check habit, complete goal, level up) 2–3 concentric rings expand from the touch point and fade; the logo uses the same waves. seed: 1d09e872 (rolled at the final audit, 2026-10-14; not applied — the direction was pinned by the user brief, PRODUCT.md:41, and composition was approved screen by screen in stages 1–3)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints
- No @material/web; implement in Tailwind + shadcn/ui (Base UI).
- Contrast 4.5:1 text / 3:1 graphics both themes; 44px touch; visible labels; no emoji icons; bottom bar ≤5.
- Motion: Motion (motion.dev) default with M3 duration/easing tokens; GSAP only where it earns it, loaded per screen; prefers-reduced-motion; never delay save/navigation.
- No business rules, calculations or DB changes.
