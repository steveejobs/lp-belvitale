import type { QuizProfile } from "./quizProfiles";

export type QuizPresentation = "cards" | "scale" | "split" | "sentence";

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly profileWeights: Readonly<Record<QuizProfile, number>>;
}

export interface QuizQuestion {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly hint: string;
  readonly presentation: QuizPresentation;
  readonly options: readonly QuizOption[];
}

function weights(
  simpleStart: number,
  gradualConsistency: number,
  consciousContinuity: number,
): Record<QuizProfile, number> {
  return {
    "simple-start": simpleStart,
    "gradual-consistency": gradualConsistency,
    "conscious-continuity": consciousContinuity,
  };
}

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "how-it-begins",
    eyebrow: "Começo",
    title: "Quando uma rotina nova chama sua atenção, como ela entra na sua vida?",
    hint: "Escolha a cena mais parecida com o seu jeito — não a ideal.",
    presentation: "cards",
    options: [
      {
        id: "begin-small",
        label: "Eu testo um gesto pequeno e vejo se cabe.",
        detail: "Pouca fricção antes de criar estrutura.",
        profileWeights: weights(3, 1, 0),
      },
      {
        id: "begin-with-time",
        label: "Eu escolho um momento do dia e preparo o caminho.",
        detail: "Um plano curto ajuda o começo.",
        profileWeights: weights(1, 3, 1),
      },
      {
        id: "begin-inside-routine",
        label: "Eu encaixo no que já faço e protejo esse horário.",
        detail: "O novo entra numa estrutura existente.",
        profileWeights: weights(0, 1, 3),
      },
    ],
  },
  {
    id: "what-breaks-the-rhythm",
    eyebrow: "Vida real",
    title: "O que costuma tirar uma rotina do lugar?",
    hint: "Pode ser a situação que mais se repete, mesmo que não aconteça sempre.",
    presentation: "scale",
    options: [
      {
        id: "week-changes",
        label: "A semana muda de forma.",
        profileWeights: weights(2, 2, 0),
      },
      {
        id: "replacement-late",
        label: "Eu percebo tarde que algo acabou.",
        profileWeights: weights(0, 1, 3),
      },
      {
        id: "perfect-start",
        label: "Quero fazer tudo certo e o começo fica grande demais.",
        profileWeights: weights(3, 1, 0),
      },
      {
        id: "one-day-break",
        label: "Um dia fora do plano faz o fio se perder.",
        profileWeights: weights(1, 3, 1),
      },
    ],
  },
  {
    id: "after-a-missed-day",
    eyebrow: "Retomada",
    title: "Um dia ficou pelo caminho. No seguinte, você…",
    hint: "Não existe resposta certa. Existe o jeito que realmente acontece.",
    presentation: "split",
    options: [
      {
        id: "resume-without-compensating",
        label: "Retoma de onde parou, sem compensar.",
        profileWeights: weights(1, 3, 2),
      },
      {
        id: "make-it-smaller",
        label: "Precisa simplificar para conseguir voltar.",
        profileWeights: weights(3, 1, 0),
      },
      {
        id: "reorganize-week",
        label: "Reorganiza o restante da semana.",
        profileWeights: weights(0, 1, 3),
      },
    ],
  },
  {
    id: "information-style",
    eyebrow: "Clareza",
    title: "Para confiar em uma rotina, a informação precisa…",
    hint: "Complete a frase com o que mais ajuda você a decidir.",
    presentation: "sentence",
    options: [
      {
        id: "direct-to-essential",
        label: "ir direto ao essencial.",
        profileWeights: weights(3, 1, 0),
      },
      {
        id: "show-next-days",
        label: "mostrar como ela cabe nos próximos dias.",
        profileWeights: weights(1, 3, 1),
      },
      {
        id: "support-planning",
        label: "deixar tudo à mão para eu planejar.",
        profileWeights: weights(0, 1, 3),
      },
    ],
  },
  {
    id: "replacement-pattern",
    eyebrow: "Continuidade",
    title: "Quando algo da rotina está perto de acabar, o que costuma acontecer?",
    hint: "Pense no seu cotidiano, não apenas em suplementos.",
    presentation: "scale",
    options: [
      {
        id: "notice-last-minute",
        label: "Eu percebo no último momento.",
        profileWeights: weights(2, 1, 0),
      },
      {
        id: "note-but-miss",
        label: "Eu anoto, mas às vezes passa.",
        profileWeights: weights(1, 3, 1),
      },
      {
        id: "next-step-ready",
        label: "Eu já deixo a próxima etapa encaminhada.",
        profileWeights: weights(0, 1, 3),
      },
      {
        id: "depends-on-week",
        label: "Depende totalmente da semana.",
        profileWeights: weights(2, 2, 1),
      },
    ],
  },
  {
    id: "realistic-commitment",
    eyebrow: "O que permanece",
    title: "Uma rotina possível para mim é aquela que…",
    hint: "Escolha a frase que você gostaria de reconhecer no seu dia.",
    presentation: "sentence",
    options: [
      {
        id: "organized-through-change",
        label: "continua organizada mesmo quando a agenda muda.",
        profileWeights: weights(1, 2, 3),
      },
      {
        id: "light-enough-to-return",
        label: "começa leve o bastante para eu querer voltar.",
        profileWeights: weights(3, 1, 0),
      },
      {
        id: "return-without-failure",
        label: "me ajuda a retomar sem transformar um dia em fracasso.",
        profileWeights: weights(1, 3, 2),
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
