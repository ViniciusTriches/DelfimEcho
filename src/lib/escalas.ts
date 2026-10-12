// Escalas de referência para metas de tempo por nível (as mesmas do seed).

export type NivelEscala = { nome: string; horas: number; fonte: string };

const FONTE_CEFR = "Cambridge English – Guided Learning Hours (estimativa)";

export const ESCALAS: { id: string; nome: string; niveis: NivelEscala[] }[] = [
  {
    id: "cefr",
    nome: "CEFR (idiomas)",
    niveis: [
      { nome: "A1", horas: 100, fonte: FONTE_CEFR },
      { nome: "A2", horas: 200, fonte: FONTE_CEFR },
      { nome: "B1", horas: 400, fonte: FONTE_CEFR },
      { nome: "B2", horas: 600, fonte: FONTE_CEFR },
      { nome: "C1", horas: 800, fonte: FONTE_CEFR },
      { nome: "C2", horas: 1200, fonte: FONTE_CEFR },
    ],
  },
  {
    id: "geral",
    nome: "Geral (heurística)",
    niveis: [
      { nome: "Iniciante funcional", horas: 20, fonte: "Ideia das “primeiras 20 horas” (Josh Kaufman)" },
      { nome: "Intermediário", horas: 100, fonte: "Heurística" },
      { nome: "Avançado", horas: 500, fonte: "Heurística" },
      { nome: "Expert", horas: 1500, fonte: "Heurística" },
      {
        nome: "Maestria",
        horas: 5000,
        fonte: "Heurística, inspirada nos estudos de prática deliberada (Ericsson)",
      },
    ],
  },
];
