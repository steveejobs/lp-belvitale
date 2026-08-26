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
    recognition: "Você se move melhor quando entende o essencial e reduz o número de dúvidas antes do primeiro gesto.",
    friction: "Informação demais pode prolongar a comparação até a decisão perder força.",
    orientation: "Escolha um critério verificável, decida por ele e deixe os detalhes secundários para depois.",
    center: { actionBias: 42, clarityNeed: 88, recoveryCapacity: 52, structurePreference: 58, proofNeed: 76 },
  },
  "return-ready": {
    id: "return-ready",
    title: "Retomar vale mais que recomeçar",
    recognition: "Seu padrão não depende de uma sequência perfeita. Ele melhora quando a volta continua pequena e possível.",
    friction: "Quando a pausa parece exigir um plano novo, a retomada fica maior do que precisa.",
    orientation: "Defina um gesto de retorno que não compense nem aumente a meta: apenas reabre o caminho.",
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
    recognition: "Você protege melhor uma escolha quando o próximo passo já está visível e não precisa ser reaberto toda semana.",
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
