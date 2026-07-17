export const quizMotionTokens = {
  touchFeedbackMs: 90,
  questionMs: 420,
  insightMs: 520,
  anticipationMs: 620,
  offerMs: 480,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const quizMotionCssVariables = {
  "--quiz-touch-ms": `${String(quizMotionTokens.touchFeedbackMs)}ms`,
  "--quiz-question-ms": `${String(quizMotionTokens.questionMs)}ms`,
  "--quiz-insight-ms": `${String(quizMotionTokens.insightMs)}ms`,
  "--quiz-anticipation-ms": `${String(quizMotionTokens.anticipationMs)}ms`,
  "--quiz-offer-ms": `${String(quizMotionTokens.offerMs)}ms`,
  "--quiz-ease": quizMotionTokens.easing,
} as const;
