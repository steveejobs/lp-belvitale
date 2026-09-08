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
  readonly excerpt?: string;
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
  clothes: { src: "/testimonials/conversa-41.webp", width: 720, height: 1563, position: "center 20%", excerpt: "Olha como já tô me sentindo melhor com meu corpo" },
  confidence: { src: "/testimonials/conversa-14.webp", width: 720, height: 1405, position: "center 18%", excerpt: "Tô me sentindo muito mais confiante pra usar meus shorts e biquínis agora." },
  experience: { src: "/testimonials/conversa-01.webp", width: 720, height: 658, position: "center top", excerpt: "Eu tava bem insegura, mas agora até me sinto melhor pra usar roupas mais justas." },
  continuity: { src: "/testimonials/conversa-28.webp", width: 720, height: 755, position: "center top", excerpt: "Olha a diferença, não está 100% ainda, mas já dá pra ver bem!" },
  comparison: { src: "/testimonials/conversa-31.webp", width: 720, height: 768, position: "center top", excerpt: "Obrigada! Vocês são muito atenciosos. Isso faz toda a diferença!" },
} as const satisfies Readonly<Record<string, InsightTestimonialProof>>;

function firstProof(answers: QuizAnswers): InsightTestimonialProof {
  if (answers["situation-weight"] === "beach") return proofs.confidence;
  if (answers["situation-weight"] === "comparison") return proofs.comparison;
  if (answers["situation-weight"] === "photos") return proofs.experience;
  return proofs.clothes;
}

function secondProof(answers: QuizAnswers): InsightTestimonialProof {
  if (answers["deepest-impact"] === "confidence") return proofs.confidence;
  if (answers["deepest-impact"] === "routine") return proofs.continuity;
  if (answers["deepest-impact"] === "nothing-works") return proofs.comparison;
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
    eyebrow: "O incômodo tem um contexto",
    title: answers["situation-weight"] === "beach" ? "O biquíni deveria ser uma escolha simples." : answers["situation-weight"] === "photos" ? "Uma foto pode chamar mais atenção para a celulite do que você gostaria." : answers["situation-weight"] === "comparison" ? "A comparação nem sempre mostra a história inteira." : "Às vezes, a escolha da roupa demora mais do que você gostaria.",
    explanation: "Você apontou momentos em que a celulite chama atenção. Isso ajuda a entender o que importa para você, mas não mede a intensidade da celulite nem define como deveria se sentir com seu corpo.",
    cta: "Olhar para o meu dia a dia",
    note: "Você pode querer cuidar da aparência da pele sem precisar gostar menos de si.",
    reflection: `Você escolheu: “${selectedLabel(answers, "situation-weight", "Na hora de me vestir.")}”`,
    signals: selectedLabels(answers, ["perception", "first-thought", "situation-weight"]),
    testimonial: firstProof(answers),
  };
}

function secondInsight(answers: QuizAnswers): PersonalizedInsight {
  return {
    sequence: 2,
    eyebrow: "Uma distinção que ajuda",
    title: answers.avoidance === "never" || answers.avoidance === "rarely" ? "Cuidar da pele pode ser uma preferência, sem virar uma cobrança." : answers["deepest-impact"] === "nothing-works" ? "Um cuidado que não funcionou não prova falta de esforço." : "A celulite não mede o quanto você se cuida.",
    explanation: answers["deepest-impact"] === "routine" ? "Você destacou a rotina. Simplificar um hábito pode ajudar a mantê-lo, mas constância e eficácia são coisas diferentes. Vale entender o que um produto pode oferecer antes de assumir um compromisso." : "Celulite envolve a estrutura da pele e dos tecidos abaixo dela. Pode aparecer mesmo em mulheres que treinam. Alimentação, exercício, cremes e procedimentos têm papéis diferentes; nenhuma dessas escolhas deve ser tratada como uma prova de disciplina.",
    cta: "Considerar o que já tentei",
    note: "Na próxima etapa, seu histórico ajuda a definir o que precisa ficar claro antes de uma compra.",
    reflection: `Você disse “${selectedLabel(answers, "reaction", "tento seguir")}” e apontou “${selectedLabel(answers, "deepest-impact", "o impacto na rotina")}” como o que mais incomoda.`,
    signals: selectedLabels(answers, ["reaction", "deepest-impact", "restart-trigger"]),
    testimonial: secondProof(answers),
  };
}

function thirdInsight(answers: QuizAnswers): PersonalizedInsight {
  return {
    sequence: 3,
    eyebrow: "Um critério para a próxima escolha",
    title: answers.history === "disappointed" ? "Depois de uma decepção, pedir mais clareza faz sentido." : answers["decision-weight"] === "money" ? "O próximo cuidado também precisa caber no seu orçamento." : "Uma rotina possível começa com expectativas claras.",
    explanation: answers.history === "disappointed" || answers["decision-weight"] === "expectation" ? "Você não precisa trocar sua dúvida por entusiasmo. Confira a composição, o que foi estudado e o que ainda não foi. Um relato pode ajudar a conhecer uma experiência, mas não prevê o seu resultado." : "Antes de escolher, compare o uso, a quantidade por embalagem e o custo total. Duração do frasco não é prazo para mudança na pele. Seu resultado vai reunir essas informações para você decidir com calma.",
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
