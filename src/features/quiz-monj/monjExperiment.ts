import { resolveStableAssignment } from "../quiz/experiment/stableAssignment";
export const monjExperimentId = "monj-opening-cta-v1";
export const monjExperimentStorageKey = "belvitale.quiz-monj.experiment.opening-cta-v1";
export const monjOpeningCtas = { a: "Começar minha análise", b: "Entender meu próximo cuidado" } as const;
export function getMonjExperimentAssignment() {
  return { experimentId: monjExperimentId, ...resolveStableAssignment(monjExperimentStorageKey, typeof window === "undefined" ? "" : window.location.search) };
}
