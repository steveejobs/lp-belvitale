import type { ConcernId, QuizAnswers } from "../domain/quiz.types";
import { getQuizOption } from "./questions";

export interface PersonalizedInsight {
  readonly sequence: 1 | 2 | 3;
  readonly eyebrow: string;
  readonly title: string;
  readonly explanation: string;
  readonly cta: string;
  readonly note?: string;
  readonly signals: readonly string[];
  readonly image?: {
    readonly src: string;
    readonly alt: string;
    readonly caption: string;
    readonly width: number;
    readonly height: number;
  };
}

export const concernCopy: Readonly<Record<ConcernId, Readonly<{
  noun: string;
  short: string;
  proofLabel: string;
}>>> = {
  cellulite: {
    noun: "a celulite e as ondulações da pele",
    short: "a celulite",
    proofLabel: "celulite",
  },
  firmness: {
    noun: "a flacidez e a perda de firmeza",
    short: "a flacidez",
    proofLabel: "flacidez",
  },
  contour: {
    noun: "o contorno de algumas regiões",
    short: "o contorno corporal",
    proofLabel: "contorno",
  },
  balanced: {
    noun: "a combinação de celulite, flacidez e contorno",
    short: "o que você vê no corpo",
    proofLabel: "celulite e flacidez",
  },
};

export function getConcernFromQuizAnswers(answers: QuizAnswers): ConcernId {
  const value = answers.perception;
  if (value === "cellulite" || value === "firmness" || value === "contour" || value === "balanced") return value;
  return "balanced";
}

function answerLabel(answers: QuizAnswers, questionId: keyof QuizAnswers, fallback: string): string {
  const optionId = answers[questionId];
  if (typeof optionId !== "string") return fallback;
  return getQuizOption(questionId, optionId)?.label ?? fallback;
}

function cleanSentence(value: string): string {
  return value.replace(/[“”]/g, "").replace(/[.…]+$/u, "").trim();
}

function firstInsight(answers: QuizAnswers): PersonalizedInsight {
  const concern = concernCopy[getConcernFromQuizAnswers(answers)];
  const thought = cleanSentence(answerLabel(answers, "first-thought", "isso volta à sua cabeça"));
  const scene = cleanSentence(answerLabel(answers, "situation-weight", "em momentos que deveriam ser leves"));
  return {
    sequence: 1,
    eyebrow: "O primeiro padrão apareceu",
    title: "Não é que isso incomode o tempo todo. É que aparece justo quando você queria se sentir livre.",
    explanation: `Você apontou ${concern.noun}. E quando o pensamento “${thought}” aparece ${scene.toLocaleLowerCase("pt-BR")}, o incômodo deixa de ocupar apenas o espelho: ele começa a participar da decisão antes de você.`,
    cta: "Quero ir mais fundo",
    note: "Isso não define quem você é. Mas revela quanto espaço esse incômodo ganhou.",
    signals: [
      `O foco hoje: ${concern.short}.`,
      `O pensamento automático: “${thought}”.`,
      `O momento de maior peso: ${scene}.`,
    ],
  };
}

const woundTitleByImpact: Readonly<Record<string, string>> = {
  appearance: "Você não está pedindo perfeição. Está cansada de negociar com o espelho.",
  confidence: "A marca na pele não fica só na pele quando a confiança encolhe junto.",
  routine: "Você não falha por falta de vontade. A rotina falha quando exige uma versão irreal de você.",
  "nothing-works": "Depois de se frustrar tantas vezes, desconfiar virou uma forma de se proteger.",
};

function secondInsight(answers: QuizAnswers): PersonalizedInsight {
  const reaction = cleanSentence(answerLabel(answers, "reaction", "você tenta seguir como se nada tivesse acontecido"));
  const interference = cleanSentence(answerLabel(answers, "avoidance", "isso já interferiu em algumas escolhas"));
  const trigger = cleanSentence(answerLabel(answers, "restart-trigger", "você espera o próximo impulso para recomeçar"));
  return {
    sequence: 2,
    eyebrow: "Aqui está a ferida real",
    title: woundTitleByImpact[answers["deepest-impact"] ?? ""] ?? "O incômodo não está só no corpo. Está no que você deixa de viver por causa dele.",
    explanation: `Você contou que costuma pensar: “${reaction}”. Também reconheceu que ${interference.toLocaleLowerCase("pt-BR")}. O custo não é apenas estético — é gastar energia se escondendo, adiando ou prometendo começar de novo.`,
    cta: "É exatamente isso",
    note: "A saída não começa com mais culpa. Começa com um cuidado pequeno o bastante para sobreviver aos dias difíceis.",
    signals: [
      `Sua reação automática: ${reaction}.`,
      `O ponto que dispara o recomeço: ${trigger}.`,
    ],
    image: {
      src: "/lifestyle/celuclin-self-care.webp",
      alt: "Mulher sentada tocando a própria coxa durante um momento de autocuidado",
      caption: "O corpo não precisa virar um campo de batalha para voltar a receber cuidado.",
      width: 720,
      height: 783,
    },
  };
}

function thirdInsight(answers: QuizAnswers): PersonalizedInsight {
  const history = cleanSentence(answerLabel(answers, "history", "você está cansada de recomeçar"));
  const dropoff = cleanSentence(answerLabel(answers, "dropoff", "a rotina interrompe o cuidado"));
  const trust = cleanSentence(answerLabel(answers, "decision-weight", "a escolha precisa caber na sua vida"));
  const future = cleanSentence(answerLabel(answers, "future-goal", "você quer construir continuidade"));
  return {
    sequence: 3,
    eyebrow: "A mudança que faz sentido para você",
    title: "Você não precisa de outra promessa que empolga hoje e decepciona depois.",
    explanation: `A sua história foi clara: “${history}”. Quando ${dropoff.toLocaleLowerCase("pt-BR")}, começar do zero parece a única opção. Mas você também deixou claro o que uma nova tentativa precisa respeitar: ${trust.toLocaleLowerCase("pt-BR")}.`,
    cta: "Ver a minha leitura",
    note: `O que você quer recuperar vai além da aparência: ${future.toLocaleLowerCase("pt-BR")}.`,
    signals: [
      "Menos promessa. Mais clareza.",
      "Menos tudo-ou-nada. Mais continuidade possível.",
      "Menos cobrança. Mais presença no próprio corpo.",
    ],
  };
}

export function buildPersonalizedInsight(
  sequence: 1 | 2 | 3,
  answers: QuizAnswers,
): PersonalizedInsight {
  if (sequence === 1) return firstInsight(answers);
  if (sequence === 2) return secondInsight(answers);
  return thirdInsight(answers);
}

