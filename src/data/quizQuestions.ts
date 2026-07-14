import type { QuizProfile } from "./quizProfiles";

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  readonly profileWeights: Readonly<Record<QuizProfile, number>>;
}

export interface QuizQuestion {
  readonly id: string;
  readonly title: string;
  readonly options: readonly QuizOption[];
}

function weights(profile: QuizProfile): Record<QuizProfile, number> {
  return {
    "simple-start": profile === "simple-start" ? 2 : 0,
    "gradual-consistency": profile === "gradual-consistency" ? 2 : 0,
    "conscious-continuity": profile === "conscious-continuity" ? 2 : 0,
  };
}

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "routine-approach",
    title: "Como você costuma lidar com novas rotinas de autocuidado?",
    options: [
      {
        id: "routine-few-steps",
        label: "Prefiro começar com poucos passos.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "routine-clear-plan",
        label: "Consigo manter quando tenho um plano claro.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "routine-organized",
        label: "Já tenho uma rotina bem organizada.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
  {
    id: "trial-period",
    title:
      "Por quanto tempo você costuma testar uma nova rotina antes de decidir continuar?",
    options: [
      {
        id: "trial-weeks",
        label: "Algumas semanas.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "trial-three-months",
        label: "Cerca de três meses.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "trial-longer",
        label: "Prefiro planejar períodos mais longos.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
  {
    id: "consistency-barrier",
    title: "O que mais dificulta sua constância?",
    options: [
      {
        id: "barrier-forgetting",
        label: "Esquecer no dia a dia.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "barrier-motivation",
        label: "Perder a motivação com o tempo.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "barrier-planning",
        label: "Falta de planejamento e reposição.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
  {
    id: "purchase-organization",
    title: "Como você prefere organizar suas compras de autocuidado?",
    options: [
      {
        id: "purchase-one-unit",
        label: "Compro uma unidade por vez.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "purchase-few-months",
        label: "Prefiro me organizar para alguns meses.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "purchase-fewer-replacements",
        label: "Gosto de evitar reposições frequentes.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
  {
    id: "current-moment",
    title: "Qual dessas frases representa melhor o seu momento?",
    options: [
      {
        id: "moment-simple",
        label: "Quero começar sem complicar.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "moment-consistency",
        label: "Quero construir mais consistência.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "moment-established",
        label: "Quero manter uma rotina já estabelecida.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
  {
    id: "supplement-priority",
    title: "O que mais importa para você ao conhecer um suplemento?",
    options: [
      {
        id: "priority-basics",
        label: "Entender o básico antes de começar.",
        profileWeights: weights("simple-start"),
      },
      {
        id: "priority-clear-information",
        label: "Ter informações claras para manter a rotina.",
        profileWeights: weights("gradual-consistency"),
      },
      {
        id: "priority-continuity",
        label: "Planejar a continuidade com antecedência.",
        profileWeights: weights("conscious-continuity"),
      },
    ],
  },
] as const;

export function getQuizQuestion(questionId: string): QuizQuestion | null {
  return quizQuestions.find((question) => question.id === questionId) ?? null;
}

export function isValidQuizOption(
  questionId: string,
  optionId: string,
): boolean {
  return (
    getQuizQuestion(questionId)?.options.some(
      (option) => option.id === optionId,
    ) ?? false
  );
}
