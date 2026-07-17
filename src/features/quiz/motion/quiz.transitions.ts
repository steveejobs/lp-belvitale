export type QuizMotionFamily =
  | "question"
  | "choice"
  | "insight"
  | "anticipation"
  | "offer";

export function getMotionFamilyAttribute(family: QuizMotionFamily): QuizMotionFamily {
  return family;
}
