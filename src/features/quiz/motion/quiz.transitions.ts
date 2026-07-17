import type { CSSProperties } from "react";
import { quizMotionCssVariables } from "./motion.tokens";

export type QuizMotionFamily =
  | "question"
  | "choice"
  | "insight"
  | "anticipation"
  | "offer";

export function getQuizMotionStyle(): CSSProperties {
  return quizMotionCssVariables as CSSProperties;
}

export function getMotionFamilyAttribute(family: QuizMotionFamily): QuizMotionFamily {
  return family;
}
