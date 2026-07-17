import type { QuizAnswerMap } from "../domain/quiz.types";

interface QuizInsight {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly detail: string;
}

const startInsights: Readonly<Record<string, Omit<QuizInsight, "detail">>> = {
  "small-visible-cue": {
    kicker: "Primeira descoberta",
    title: "Seu começo pede uma pista, não um grande plano.",
    body: "Quando o próximo passo fica visível, você reduz o esforço de lembrar e abre espaço para repetir.",
  },
  "understand-first": {
    kicker: "Primeira descoberta",
    title: "Clareza é parte do seu começo.",
    body: "Para você, entender não é demora: é o que transforma curiosidade em uma escolha consciente.",
  },
  "motivation-sprint": {
    kicker: "Primeira descoberta",
    title: "Seu começo tem energia — o segredo é deixar uma ponte.",
    body: "O embalo abre a porta. Uma pista simples pode mantê-la aberta quando a intensidade inicial diminuir.",
  },
  "fit-as-i-go": {
    kicker: "Primeira descoberta",
    title: "Você começa melhor quando pode ajustar.",
    body: "Flexibilidade não é falta de compromisso; é a forma de fazer a escolha caber em dias diferentes.",
  },
};

const appearanceDetails: Readonly<Record<string, string>> = {
  "clothes-waited": "E isso ganha relevância porque uma escolha de roupa já foi atravessada por essa percepção.",
  "photo-almost-missed": "E isso ganha relevância porque houve um instante em que você quase ficou fora de uma foto.",
  "noticed-and-lived": "Você também mostrou que consegue perceber a aparência sem entregar a ela todas as decisões do dia.",
  "changes-with-the-day": "Como o impacto varia, uma estrutura adaptável tende a servir melhor do que uma regra rígida.",
};

export function deriveStartInsight(answers: QuizAnswerMap): QuizInsight {
  const start = answers["way-of-starting"];
  const appearance = answers["appearance-moment"];
  const base = start === undefined
    ? {
        kicker: "Primeira descoberta",
        title: "O seu começo já deixou uma pista.",
        body: "Pequenas condições do dia influenciam mais do que uma versão ideal de rotina.",
      }
    : startInsights[start] ?? {
        kicker: "Primeira descoberta",
        title: "O seu começo já deixou uma pista.",
        body: "Pequenas condições do dia influenciam mais do que uma versão ideal de rotina.",
      };
  return {
    ...base,
    detail:
      appearance === undefined
        ? "Essa leitura usa somente as duas escolhas que você já fez."
        : appearanceDetails[appearance] ?? "Essa leitura usa somente as duas escolhas que você já fez.",
  };
}

const frictionLabels: Readonly<Record<string, string>> = {
  "full-days": "dias cheios tirarem o cuidado do campo de visão",
  "out-of-sight": "a rotina ficar invisível no ambiente",
  "too-many-steps": "muitos passos tornarem a escolha pesada",
  "unclear-information": "a dúvida reaparecer no meio do caminho",
};

const proofLabels: Readonly<Record<string, string>> = {
  "label-and-facts": "rótulo e fatos objetivos",
  "full-size-authorized-images": "imagens autorizadas, grandes e acompanhadas de limites",
  "options-side-by-side": "critérios comparados lado a lado",
  "time-without-pressure": "tempo para revisar sem pressão",
};

export function deriveProofInsight(answers: QuizAnswerMap): QuizInsight {
  const friction = frictionLabels[answers["routine-friction"] ?? ""] ?? "uma fricção concreta atravessar a rotina";
  const proof = proofLabels[answers["trust-language"] ?? ""] ?? "informação clara e revisável";
  return {
    kicker: "Segunda descoberta",
    title: `Sua constância fica mais vulnerável quando ${friction}.`,
    body: `Para reduzir a dúvida, você indicou que ${proof} ajuda mais do que uma promessa ampla.`,
    detail:
      "Isso personaliza a forma de explicar o resultado. Não define quantidade, duração nem eficácia.",
  };
}

export const storyInterstitial = {
  kicker: "Entre começar e continuar",
  title: "Uma rotina não precisa vencer todos os dias.",
  body:
    "Ela precisa sobreviver aos dias comuns: à agenda que muda, ao esquecimento e à pausa. A próxima cena observa justamente o que acontece depois.",
} as const;

export const anticipationContent = {
  kicker: "Suas escolhas estão se encontrando",
  title: "Separando o seu ritmo da decisão comercial.",
  steps: [
    "Lendo como você começa e retoma",
    "Identificando a fricção e a prova que ajudam",
    "Aplicando somente as respostas comerciais à duração",
  ],
} as const;
