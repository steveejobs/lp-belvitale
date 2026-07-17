import { proofAssets } from "../../../data/proofGallery";
import type { ConcernId } from "../domain/quiz.types";

const categoryByConcern = {
  cellulite: "cellulite",
  firmness: "laxity",
  contour: "localized-fat",
  balanced: "cellulite",
} as const satisfies Record<ConcernId, (typeof proofAssets)[number]["category"]>;

export function getConcernFromAnswers(concernOptionId: string | undefined): ConcernId {
  if (concernOptionId === "cellulite" || concernOptionId === "firmness" || concernOptionId === "contour") {
    return concernOptionId;
  }
  return "balanced";
}

export function getPersonalizedProof(concern: ConcernId) {
  const preferred = categoryByConcern[concern];
  const orderedCategories = [preferred, "cellulite", "laxity", "localized-fat"] as const;
  const uniqueCategories = orderedCategories.filter((category, index) => orderedCategories.indexOf(category) === index);
  return uniqueCategories.flatMap((category) => proofAssets.filter((asset) => asset.category === category));
}

export const concernLabels: Readonly<Record<ConcernId, string>> = {
  cellulite: "Aparência da celulite",
  firmness: "Aparência de firmeza",
  contour: "Contorno de algumas regiões",
  balanced: "Seleção equilibrada",
};
