export const quizDimensionIds = [
  "startEase",
  "recovery",
  "simplicity",
  "consistency",
  "planning",
  "replenishmentRelief",
  "autonomy",
  "commitmentComfort",
] as const;

export type QuizDimension = (typeof quizDimensionIds)[number];
export type QuizDimensionImpact = Readonly<
  Partial<Record<QuizDimension, number>>
>;

export type QuizPresentation =
  | "scenes"
  | "tactile"
  | "contrast"
  | "path"
  | "sentence"
  | "priority";

export interface QuizAnswer {
  readonly questionId: string;
  readonly optionId: string;
}

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly impact: QuizDimensionImpact;
}

export interface QuizQuestion {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly hint: string;
  readonly presentation: QuizPresentation;
  readonly adaptiveFor?: readonly QuizDimension[];
  readonly options: readonly QuizOption[];
}

const option = (
  id: string,
  label: string,
  impact: QuizDimensionImpact,
  detail?: string,
): QuizOption => ({ id, label, impact, ...(detail === undefined ? {} : { detail }) });

export const commonQuizQuestions = [
  {
    id: "first-move",
    eyebrow: "A primeira cena",
    title: "Você decide abrir espaço para um cuidado novo. O que acontece nas próximas 24 horas?",
    hint: "Escolha o que mais se parece com a vida real, não com o plano perfeito.",
    presentation: "scenes",
    options: [
      option(
        "start-tiny-now",
        "Faço um teste pequeno, sem organizar o resto.",
        {
          startEase: 2,
          simplicity: 2,
          planning: -2,
          autonomy: 1,
          commitmentComfort: -2,
        },
        "Primeiro sentir se cabe; depois decidir o próximo passo.",
      ),
      option(
        "choose-a-place",
        "Escolho onde isso cabe no meu dia.",
        {
          startEase: 1,
          consistency: 2,
          planning: 1,
          simplicity: 1,
          commitmentComfort: 1,
        },
        "Um lugar claro ajuda o começo a ganhar forma.",
      ),
      option(
        "understand-first",
        "Entendo o essencial e decido com calma.",
        {
          autonomy: 2,
          simplicity: 1,
          startEase: -1,
          planning: 1,
          commitmentComfort: -1,
        },
        "Clareza vem antes da primeira ação.",
      ),
      option(
        "prepare-the-way",
        "Deixo o caminho preparado antes de começar.",
        {
          planning: 2,
          consistency: 1,
          startEase: -1,
          replenishmentRelief: 1,
          commitmentComfort: 2,
        },
        "Organizar antes reduz decisões no meio do caminho.",
      ),
    ],
  },
  {
    id: "planning-dose",
    eyebrow: "A medida do plano",
    title: "Planejamento ajuda você até que ponto?",
    hint: "Toque no ponto em que organização ainda parece leve.",
    presentation: "tactile",
    options: [
      option(
        "next-gesture",
        "Só o próximo gesto",
        {
          simplicity: 2,
          planning: -2,
          autonomy: 1,
          commitmentComfort: -2,
        },
      ),
      option(
        "few-days",
        "Alguns dias à vista",
        {
          simplicity: 1,
          planning: 0.5,
          consistency: 1,
          autonomy: 1,
          commitmentComfort: -0.5,
        },
      ),
      option(
        "week-shaped",
        "Uma semana organizada",
        {
          planning: 2,
          consistency: 1,
          simplicity: -1,
          commitmentComfort: 1,
        },
      ),
      option(
        "future-decided",
        "Reposições já encaminhadas",
        {
          planning: 2,
          replenishmentRelief: 2,
          consistency: 1,
          commitmentComfort: 2,
        },
      ),
    ],
  },
  {
    id: "missed-day",
    eyebrow: "Depois da pausa",
    title: "Ontem não aconteceu. Hoje, qual movimento é mais seu?",
    hint: "Um dia fora não precisa virar uma história maior.",
    presentation: "contrast",
    options: [
      option(
        "resume-usual",
        "Volto no ponto habitual, sem compensar.",
        {
          recovery: 2,
          consistency: 2,
          simplicity: 1,
          commitmentComfort: 1,
        },
      ),
      option(
        "make-smaller",
        "Diminuo o gesto até ele caber de novo.",
        {
          recovery: 2,
          simplicity: 2,
          consistency: 1,
          commitmentComfort: -1,
        },
      ),
      option(
        "change-time",
        "Troco o horário e sigo o dia.",
        {
          recovery: 1,
          autonomy: 2,
          planning: -1,
          consistency: 1,
        },
      ),
      option(
        "reshape-days",
        "Reorganizo os próximos dias antes de voltar.",
        {
          recovery: -0.5,
          planning: 2,
          consistency: 1,
          startEase: -1,
          commitmentComfort: 1,
        },
      ),
    ],
  },
  {
    id: "choice-lightness",
    eyebrow: "Na hora de escolher",
    title: "Uma escolha fica leve quando você consegue…",
    hint: "Complete a frase com o que mais ajuda a decidir.",
    presentation: "sentence",
    options: [
      option(
        "see-essential",
        "ver o essencial e seguir.",
        {
          autonomy: 2,
          simplicity: 2,
          planning: -1,
          commitmentComfort: -1,
        },
      ),
      option(
        "picture-routine",
        "enxergar como isso cabe no dia.",
        {
          autonomy: 1,
          consistency: 2,
          simplicity: 1,
          planning: 1,
        },
      ),
      option(
        "information-at-hand",
        "ter tudo à mão e decidir no seu tempo.",
        {
          autonomy: 2,
          planning: 2,
          simplicity: -1,
          commitmentComfort: 1,
        },
      ),
      option(
        "repeat-fewer-decisions",
        "diminuir decisões que precisaria repetir.",
        {
          replenishmentRelief: 2,
          planning: 1,
          simplicity: 1,
          commitmentComfort: 2,
        },
      ),
    ],
  },
  {
    id: "what-stays",
    eyebrow: "O que permanece",
    title: "Sem pensar demais: você mantém melhor o que…",
    hint: "A última escolha é sobre sustentabilidade, não sobre perfeição.",
    presentation: "priority",
    options: [
      option(
        "small-commitment",
        "pode começar sem grande compromisso.",
        {
          startEase: 2,
          simplicity: 2,
          planning: -2,
          commitmentComfort: -2,
          replenishmentRelief: -1,
        },
      ),
      option(
        "survives-change",
        "continua possível quando a semana muda.",
        {
          recovery: 2,
          autonomy: 1,
          consistency: 1,
          commitmentComfort: 0.5,
        },
      ),
      option(
        "has-clear-place",
        "ganha um lugar claro no dia.",
        {
          consistency: 2,
          planning: 1,
          startEase: 1,
          commitmentComfort: 1,
        },
      ),
      option(
        "months-decided",
        "já deixa os próximos meses encaminhados.",
        {
          planning: 2,
          replenishmentRelief: 2,
          consistency: 1,
          commitmentComfort: 2,
        },
      ),
    ],
  },
] as const satisfies readonly QuizQuestion[];

export const adaptiveQuizQuestions = [
  {
    id: "adaptive-return",
    eyebrow: "Uma pista a mais",
    title: "Quando a sequência quebra, o que torna a volta mais natural?",
    hint: "Escolha a ajuda que funciona sem cobrança.",
    presentation: "path",
    adaptiveFor: ["recovery"],
    options: [
      option("return-next-gesture", "Saber qual é o próximo gesto.", {
        recovery: 2,
        simplicity: 1,
        planning: 1,
        consistency: 1,
      }),
      option("return-other-time", "Poder voltar em outro horário.", {
        recovery: 2,
        autonomy: 2,
        planning: -1,
        consistency: 0.5,
      }),
      option("return-visible", "Encontrar o cuidado onde costumo passar.", {
        recovery: 1,
        consistency: 2,
        simplicity: 1,
        startEase: 1,
      }),
      option("return-replan", "Reorganizar a semana sem pressa.", {
        recovery: 1,
        planning: 2,
        startEase: -1,
        commitmentComfort: 1,
      }),
    ],
  },
  {
    id: "adaptive-supply",
    eyebrow: "Uma pista a mais",
    title: "Você percebe que algo da rotina vai acabar. O que costuma acontecer?",
    hint: "Não é sobre comprar mais. É sobre como você prefere decidir.",
    presentation: "path",
    adaptiveFor: ["planning", "replenishmentRelief", "commitmentComfort"],
    options: [
      option("supply-near-end", "Decido só quando estiver perto do fim.", {
        replenishmentRelief: -2,
        autonomy: 2,
        planning: -1,
        commitmentComfort: -2,
      }),
      option("supply-next-buy", "Anoto e resolvo na próxima compra.", {
        replenishmentRelief: 0.5,
        planning: 1,
        consistency: 1,
        commitmentComfort: 0.5,
      }),
      option("supply-anticipate", "Antecipar evita uma decisão no meio do caminho.", {
        replenishmentRelief: 2,
        planning: 2,
        consistency: 1,
        commitmentComfort: 1,
      }),
      option("supply-concentrate", "Concentro a escolha e fico um tempo sem pensar nisso.", {
        replenishmentRelief: 2,
        autonomy: 1,
        planning: 2,
        simplicity: 1,
        commitmentComfort: 2,
      }),
    ],
  },
  {
    id: "adaptive-simple",
    eyebrow: "Uma pista a mais",
    title: "Uma rotina parece sustentável quando a instrução…",
    hint: "Escolha o formato que sua cabeça aceita melhor.",
    presentation: "path",
    adaptiveFor: ["simplicity"],
    options: [
      option("simple-one-line", "cabe em uma frase.", {
        simplicity: 2,
        startEase: 1,
        autonomy: 1,
        planning: -1,
      }),
      option("simple-essential-free", "mostra o essencial e deixa o resto livre.", {
        simplicity: 2,
        autonomy: 2,
        planning: -1,
        commitmentComfort: -1,
      }),
      option("simple-existing-habit", "se liga a algo que já acontece.", {
        consistency: 2,
        simplicity: 1,
        recovery: 1,
        startEase: 1,
      }),
      option("simple-next-visible", "deixa os próximos passos visíveis.", {
        planning: 2,
        consistency: 1,
        autonomy: 1,
        simplicity: 0.5,
      }),
    ],
  },
  {
    id: "adaptive-real-life",
    eyebrow: "Uma pista a mais",
    title: "Na vida real, o que transforma intenção em repetição?",
    hint: "Pense no que já funcionou, mesmo em outra área da vida.",
    presentation: "path",
    adaptiveFor: ["startEase", "consistency", "autonomy"],
    options: [
      option("real-before-perfect", "Começar antes de tudo estar perfeito.", {
        startEase: 2,
        simplicity: 1,
        recovery: 1,
        planning: -1,
      }),
      option("real-visible-place", "Ter um lugar que me lembra.", {
        consistency: 2,
        planning: 1,
        simplicity: 1,
        startEase: 1,
      }),
      option("real-adapt", "Poder adaptar sem sentir que perdi o fio.", {
        recovery: 2,
        autonomy: 2,
        consistency: 1,
        planning: -1,
      }),
      option("real-decide-around", "Resolver de uma vez as decisões ao redor.", {
        planning: 2,
        replenishmentRelief: 1,
        autonomy: 1,
        commitmentComfort: 1,
      }),
    ],
  },
] as const satisfies readonly QuizQuestion[];

export const quizQuestions = [
  ...commonQuizQuestions,
  ...adaptiveQuizQuestions,
] as const satisfies readonly QuizQuestion[];

export const quizTotalSteps = 6;
export const quizCommonOpeningQuestions = commonQuizQuestions.slice(0, 3);
export const quizCommonClosingQuestions = commonQuizQuestions.slice(3);

export function getQuizQuestion(questionId: string): QuizQuestion | null {
  return quizQuestions.find((question) => question.id === questionId) ?? null;
}

export function isAdaptiveQuizQuestion(questionId: string): boolean {
  return adaptiveQuizQuestions.some((question) => question.id === questionId);
}

export function isValidQuizOption(
  questionId: string,
  optionId: string,
): boolean {
  return (
    getQuizQuestion(questionId)?.options.some(
      (candidate) => candidate.id === optionId,
    ) ?? false
  );
}
