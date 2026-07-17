import type { QuizAnswer, QuizDimension } from "../data/quizQuestions";
import { calculateQuizDimensions } from "./quizScoring";

export type QuizCheckpoint = "after-planning" | "after-adaptive";

export interface QuizMicroInsight {
  readonly id: string;
  readonly label: "Uma pista do seu ritmo";
  readonly text: string;
  readonly derivedFrom: readonly QuizDimension[];
}

export function deriveQuizMicroInsight(
  checkpoint: QuizCheckpoint,
  answers: readonly QuizAnswer[],
): QuizMicroInsight {
  const vector = calculateQuizDimensions(answers);

  if (checkpoint === "after-planning") {
    if (vector.planning >= 68 || vector.replenishmentRelief >= 68) {
      return {
        id: "planning-already-decided",
        label: "Uma pista do seu ritmo",
        text: "Para você, uma rotina funciona melhor quando parte dela já está decidida.",
        derivedFrom: ["planning", "replenishmentRelief"],
      };
    }
    if (vector.simplicity >= 66) {
      return {
        id: "less-friction",
        label: "Uma pista do seu ritmo",
        text: "Você não parece precisar de mais cobrança. Precisa de menos atrito.",
        derivedFrom: ["simplicity", "startEase"],
      };
    }
    return {
      id: "choice-stays-yours",
      label: "Uma pista do seu ritmo",
      text: "Seu começo ganha força quando a escolha continua sendo sua.",
      derivedFrom: ["autonomy", "startEase"],
    };
  }

  if (vector.recovery >= 68) {
    return {
      id: "return-is-strength",
      label: "Uma pista do seu ritmo",
      text: "Seu ponto forte talvez não seja fazer tudo perfeito. É saber voltar.",
      derivedFrom: ["recovery", "consistency"],
    };
  }
  if (vector.replenishmentRelief >= 68 || vector.planning >= 72) {
    return {
      id: "fewer-repeated-decisions",
      label: "Uma pista do seu ritmo",
      text: "Você protege melhor uma rotina quando evita decisões repetidas.",
      derivedFrom: ["replenishmentRelief", "planning"],
    };
  }
  if (vector.consistency >= 66) {
    return {
      id: "gesture-has-place",
      label: "Uma pista do seu ritmo",
      text: "O gesto fica mais leve quando já encontra um lugar no dia.",
      derivedFrom: ["consistency", "simplicity"],
    };
  }
  return {
    id: "recognizable-path",
    label: "Uma pista do seu ritmo",
    text: "Seu ritmo não pede rigidez. Pede um caminho fácil de reconhecer.",
    derivedFrom: ["autonomy", "simplicity", "recovery"],
  };
}
