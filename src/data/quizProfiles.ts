export type QuizProfile =
  | "simple-start"
  | "gradual-consistency"
  | "conscious-continuity";

export interface QuizResultProfile {
  readonly id: QuizProfile;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly characteristics: readonly string[];
  readonly nextStep: string;
}

export const quizProfileOrder: readonly QuizProfile[] = [
  "simple-start",
  "gradual-consistency",
  "conscious-continuity",
] as const;

export const quizProfiles: Readonly<Record<QuizProfile, QuizResultProfile>> = {
  "simple-start": {
    id: "simple-start",
    eyebrow: "Perfil de rotina",
    title: "Começo simples",
    description:
      "Você tende a se adaptar melhor a rotinas diretas, com poucos passos e espaço para avaliar a experiência antes de assumir compromissos maiores.",
    characteristics: [
      "Prefere começar com clareza.",
      "Valoriza pouca complexidade.",
      "Evita compromissos longos no início.",
    ],
    nextStep:
      "Conheça a composição e o modo de uso do CeluClin antes de decidir.",
  },
  "gradual-consistency": {
    id: "gradual-consistency",
    eyebrow: "Perfil de rotina",
    title: "Constância gradual",
    description:
      "Você tende a manter melhor uma rotina quando existe organização, continuidade e um plano claro para acompanhar os próximos meses.",
    characteristics: [
      "Valoriza um plano compreensível.",
      "Prefere construir constância aos poucos.",
      "Organiza a rotina por alguns meses.",
    ],
    nextStep:
      "Revise a composição e o modo de uso do CeluClin para fazer uma escolha informada.",
  },
  "conscious-continuity": {
    id: "conscious-continuity",
    eyebrow: "Perfil de rotina",
    title: "Continuidade consciente",
    description:
      "Você já valoriza hábitos consistentes e prefere planejar a continuidade com antecedência, evitando interrupções e reposições frequentes.",
    characteristics: [
      "Mantém hábitos com regularidade.",
      "Planeja a continuidade com antecedência.",
      "Prefere reduzir reposições frequentes.",
    ],
    nextStep:
      "Consulte a composição e o modo de uso do CeluClin antes de organizar sua próxima rotina.",
  },
};

export function isQuizProfile(value: unknown): value is QuizProfile {
  return quizProfileOrder.some((profile) => profile === value);
}
