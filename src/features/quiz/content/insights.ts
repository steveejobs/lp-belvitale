import type { ConcernId, QuizAnswers, QuizQuestionId } from "../domain/quiz.types";
import { getQuizOption } from "./questions";

export interface PersonalizedInsight {
  readonly sequence: 1 | 2 | 3;
  readonly eyebrow: string;
  readonly title: string;
  readonly explanation: string;
  readonly cta: string;
  readonly note?: string;
  readonly reflection: string;
  readonly signals: readonly string[];
  readonly testimonial: InsightTestimonialProof;
}

export interface InsightTestimonialProof {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly position: string;
}

export const concernCopy: Readonly<Record<ConcernId, Readonly<{
  noun: string;
  short: string;
  proofLabel: string;
}>>> = {
  cellulite: { noun: "a celulite", short: "a celulite", proofLabel: "celulite" },
  firmness: { noun: "a celulite", short: "a celulite", proofLabel: "celulite" },
  contour: { noun: "a celulite", short: "a celulite", proofLabel: "celulite" },
  balanced: { noun: "a celulite", short: "a celulite", proofLabel: "celulite" },
};

export function getConcernFromQuizAnswers(answers: QuizAnswers): ConcernId {
  void answers;
  return "cellulite";
}

function selectedLabels(answers: QuizAnswers, questionIds: readonly QuizQuestionId[]): readonly string[] {
  return questionIds.flatMap((questionId) => {
    const optionId = answers[questionId];
    if (typeof optionId !== "string") return [];
    const label = getQuizOption(questionId, optionId)?.label;
    return label === undefined ? [] : [label];
  });
}

function selectedLabel(answers: QuizAnswers, questionId: QuizQuestionId, fallback: string): string {
  return selectedLabels(answers, [questionId])[0] ?? fallback;
}

const proofs = {
  clothes: { src: "/testimonials/conversa-41.webp", width: 720, height: 1563, position: "center 20%" },
  confidence: { src: "/testimonials/conversa-14.webp", width: 720, height: 1405, position: "center 18%" },
  experience: { src: "/testimonials/conversa-01.webp", width: 720, height: 658, position: "center top" },
  continuity: { src: "/testimonials/conversa-28.webp", width: 720, height: 755, position: "center top" },
  comparison: { src: "/testimonials/conversa-31.webp", width: 720, height: 768, position: "center top" },
  progress: { src: "/testimonials/conversa-07.webp", width: 720, height: 1279, position: "center 16%" },
} as const satisfies Readonly<Record<string, InsightTestimonialProof>>;

function firstProof(answers: QuizAnswers): InsightTestimonialProof {
  if (answers["situation-weight"] === "beach") return proofs.confidence;
  if (answers["situation-weight"] === "comparison") return proofs.comparison;
  if (answers["situation-weight"] === "photos") return proofs.progress;
  return proofs.clothes;
}

function secondProof(answers: QuizAnswers): InsightTestimonialProof {
  if (answers["deepest-impact"] === "confidence") return proofs.confidence;
  if (answers["deepest-impact"] === "routine") return proofs.continuity;
  if (answers["deepest-impact"] === "nothing-works") return proofs.progress;
  return proofs.experience;
}

function thirdProof(answers: QuizAnswers): InsightTestimonialProof {
  if (answers["future-goal"] === "trust") return proofs.clothes;
  if (answers["future-goal"] === "simple-care") return proofs.comparison;
  if (answers["future-goal"] === "stop-restarting") return proofs.experience;
  return proofs.continuity;
}

function firstInsight(answers: QuizAnswers): PersonalizedInsight {
  return {
    sequence: 1,
    eyebrow: "Uma observação importante",
    title: "Até aqui, percebemos uma coisa interessante.",
    explanation: "Suas respostas mostram que o incômodo não aparece o tempo todo. Ele costuma surgir em momentos específicos. É assim que, quase sem perceber, muitas mulheres começam a deixar a insegurança influenciar pequenas escolhas do dia a dia.",
    cta: "Continuar",
    note: "Nenhum diagnóstico milagroso. Nenhuma IA. Apenas uma observação humana.",
    reflection: `Você marcou “${selectedLabel(answers, "perception", "quando a celulite aparece")}” e “${selectedLabel(answers, "situation-weight", "quando isso pesa mais")}”. O padrão começa nesses momentos.`,
    signals: selectedLabels(answers, ["perception", "first-thought", "situation-weight"]),
    testimonial: firstProof(answers),
  };
}

function secondInsight(answers: QuizAnswers): PersonalizedInsight {
  return {
    sequence: 2,
    eyebrow: "Uma nova perspectiva",
    title: "Talvez o problema nunca tenha sido falta de vontade.",
    explanation: "Até aqui, suas respostas mostram um padrão comum. Você parece saber que gostaria de mudar. O difícil não é decidir. É conseguir manter a decisão quando a rotina volta ao normal.",
    cta: "Faz sentido",
    reflection: `Você disse “${selectedLabel(answers, "reaction", "tento seguir")}” e apontou “${selectedLabel(answers, "deepest-impact", "o impacto na rotina")}” como o que mais incomoda.`,
    signals: selectedLabels(answers, ["reaction", "deepest-impact", "restart-trigger"]),
    testimonial: secondProof(answers),
  };
}

function thirdInsight(answers: QuizAnswers): PersonalizedInsight {
  return {
    sequence: 3,
    eyebrow: "O padrão por trás do recomeço",
    title: "Sua dificuldade parece estar menos ligada à disciplina do que à forma como você tenta recomeçar.",
    explanation: "Muitas mulheres acreditam que precisam de mais força de vontade. Mas, na prática, elas precisam de uma rotina simples o bastante para ser mantida até nos dias corridos. É exatamente por isso que algumas estratégias duram poucos dias, enquanto outras conseguem fazer parte da vida.",
    cta: "Ver meu resultado",
    reflection: `Você contou “${selectedLabel(answers, "dropoff", "a rotina interrompe")}”. E também escolheu “${selectedLabel(answers, "future-goal", "quero parar de recomeçar")}”. É entre esses dois pontos que sua resposta aparece.`,
    signals: selectedLabels(answers, ["history", "dropoff", "future-goal"]),
    testimonial: thirdProof(answers),
  };
}

export function buildPersonalizedInsight(sequence: 1 | 2 | 3, answers: QuizAnswers): PersonalizedInsight {
  if (sequence === 1) return firstInsight(answers);
  if (sequence === 2) return secondInsight(answers);
  return thirdInsight(answers);
}
