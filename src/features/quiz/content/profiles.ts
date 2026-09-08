import type { NarrativeDimension, NarrativeProfileId, QuizAnswers } from "../domain/quiz.types";
import { getQuizOption } from "./questions";

export interface QuizProfileContent {
  readonly id: NarrativeProfileId;
  readonly title: string;
  readonly recognition: string;
  readonly friction: string;
  readonly orientation: string;
  readonly center: Readonly<Record<NarrativeDimension, number>>;
}

export const quizProfileOrder = [
  "clear-first",
  "return-ready",
  "proof-led",
  "continuity-minded",
] as const satisfies readonly NarrativeProfileId[];

export const quizProfiles: Readonly<Record<NarrativeProfileId, QuizProfileContent>> = {
  "clear-first": {
    id: "clear-first",
    title: "Clareza antes do impulso",
    recognition: "Suas respostas sugerem que entender a proposta vem antes de comprar. Você quer saber o que está levando para casa e o que pode esperar.",
    friction: "Ainda faltam respostas antes de decidir?",
    orientation: "Confira a composição, os limites da evidência e o custo total. A comparação abaixo reúne esses pontos para você escolher sem pressa.",
    center: { actionBias: 42, clarityNeed: 88, recoveryCapacity: 52, structurePreference: 58, proofNeed: 76 },
  },
  "return-ready": {
    id: "return-ready",
    title: "Retomar vale mais que recomeçar",
    recognition: "Você marcou respostas ligadas a começar, interromper e tentar novamente. Um cuidado precisa caber também nos dias em que a rotina muda.",
    friction: "Quando a pausa parece exigir um plano novo, a retomada fica maior do que precisa.",
    orientation: "Se decidir incluir um cuidado, escolha um horário possível e siga as orientações do rótulo. Uma pausa não precisa virar uma cobrança sobre você.",
    center: { actionBias: 72, clarityNeed: 42, recoveryCapacity: 92, structurePreference: 48, proofNeed: 40 },
  },
  "proof-led": {
    id: "proof-led",
    title: "Confiança move sua escolha",
    recognition: "Você parece depender mais de evidência compreensível do que de entusiasmo momentâneo.",
    friction: "Promessas amplas ou imagens sem contexto aumentam sua distância em vez de acelerar a decisão.",
    orientation: "Procure origem, limites e comparação clara. Se a informação não responde ao básico, não merece sua pressa.",
    center: { actionBias: 44, clarityNeed: 78, recoveryCapacity: 46, structurePreference: 48, proofNeed: 94 },
  },
  "continuity-minded": {
    id: "continuity-minded",
    title: "Estrutura reduz decisões",
    recognition: "Você deu importância a ter uma rotina possível. Saber como usar, quanto dura e quando avaliar a continuidade pode ajudar a organizar sua escolha.",
    friction: "Começar sem uma âncora ou sem continuidade definida deixa a rotina vulnerável aos dias cheios.",
    orientation: "Organize um ponto fixo, uma alternativa para dias fora do padrão e uma data simples de revisão.",
    center: { actionBias: 60, clarityNeed: 56, recoveryCapacity: 64, structurePreference: 94, proofNeed: 48 },
  },
};

export function deriveRecognitions(answers: QuizAnswers): readonly [string, string, string] {
  const history = typeof answers.history === "string" ? getQuizOption("history", answers.history) : null;
  const weight = typeof answers["decision-weight"] === "string"
    ? getQuizOption("decision-weight", answers["decision-weight"])
    : null;
  const future = typeof answers["future-goal"] === "string" ? getQuizOption("future-goal", answers["future-goal"]) : null;
  return [
    history?.label ?? "Você reconhece o que costuma interromper a continuidade.",
    weight?.label ?? "Sua retomada depende de um próximo gesto claro.",
    future?.label ?? "Você busca um cuidado que caiba na rotina real.",
  ];
}
