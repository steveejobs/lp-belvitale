export const quizMotion = {
  microMs: 150,
  stateMs: 240,
  transitionMs: 340,
  revealMs: 520,
  heroEntranceMs: 640,
  feedbackMs: 120,
  selectionMs: 220,
  autoAdvanceDelayMs: 380,
  exitMs: 200,
  enterMs: 340,
  finalRevealMs: 560,
  rewardRevealMs: 520,
  easing: {
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.7, 0, 0.84, 0)",
    state: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;
