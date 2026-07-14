export type FactStatus = "confirmed" | "pending" | "conflicting" | "unreadable";

export type FactSource = "label" | "document" | "both";

export interface IngredientFact {
  readonly id: string;
  readonly name: string;
  readonly amount?: string;
  readonly dailyValue?: string;
  readonly status: FactStatus;
  readonly source: FactSource;
  readonly labelName?: string;
}

export interface WarningFact {
  readonly id: string;
  readonly text: string;
  readonly status: FactStatus;
  readonly source: FactSource;
}

export interface UsageFact {
  readonly totalCapsules?: number;
  readonly servingsPerContainer?: number;
  readonly capsulesPerServing?: number;
  readonly capsulesPerDay?: number;
  readonly suggestedUse?: string;
  readonly durationDays?: number | null;
  readonly audience?: string;
  readonly status: FactStatus;
  readonly source: FactSource;
}

export type FormulaPublicationState = "confirmed" | "partial" | "blocked";

export function calculateBottleDuration(
  totalCapsules?: number | null,
  capsulesPerDay?: number | null,
): number | null {
  if (
    totalCapsules === undefined ||
    totalCapsules === null ||
    capsulesPerDay === undefined ||
    capsulesPerDay === null ||
    !Number.isFinite(totalCapsules) ||
    !Number.isFinite(capsulesPerDay) ||
    totalCapsules <= 0 ||
    capsulesPerDay <= 0 ||
    !Number.isInteger(totalCapsules) ||
    !Number.isInteger(capsulesPerDay) ||
    totalCapsules % capsulesPerDay !== 0
  ) {
    return null;
  }

  return totalCapsules / capsulesPerDay;
}

export const ingredientFacts: readonly IngredientFact[] = [
  {
    id: "apple-peel-fiber",
    name: "Fibra da casca da maçã",
    amount: "150 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "oat-fiber",
    name: "Fibra de aveia",
    amount: "150 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "quercetin",
    name: "Quercetina",
    amount: "100 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "vitamin-c",
    name: "Vitamina C",
    amount: "100 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "zinc",
    name: "Zinco",
    amount: "11 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "turmeric",
    name: "Extrato de cúrcuma",
    amount: "130 mg",
    labelName: "Extrato de Rizoma de Cúrcuma (Curcumina)",
    status: "conflicting",
    source: "both",
  },
  {
    id: "chlorella",
    name: "Chlorella",
    amount: "100 mg",
    status: "confirmed",
    source: "both",
  },
  {
    id: "spirulina",
    name: "Spirulina",
    amount: "100 mg",
    status: "confirmed",
    source: "both",
  },
];

const totalCapsules = 60;
const capsulesPerDay = 2;

export const usageFact: UsageFact = {
  totalCapsules,
  servingsPerContainer: 30,
  capsulesPerServing: 2,
  capsulesPerDay,
  suggestedUse: "2 cápsulas ao dia",
  durationDays: calculateBottleDuration(totalCapsules, capsulesPerDay),
  audience: "Maiores de 19 anos",
  status: "confirmed",
  source: "both",
};

export const warningFacts: readonly WarningFact[] = [
  {
    id: "not-medicine",
    text: "CeluClin é um suplemento alimentar e não é medicamento.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "pregnancy-and-children",
    text: "O rótulo informa que o produto não deve ser consumido por gestantes, lactantes e crianças.",
    status: "confirmed",
    source: "both",
  },
];

export const professionalGuidance =
  "Siga as orientações da embalagem e procure orientação profissional quando necessário.";

export function getPublishableIngredients(
  facts: readonly IngredientFact[],
): readonly IngredientFact[] {
  return facts.filter(
    (fact) =>
      fact.status === "confirmed" &&
      fact.amount !== undefined &&
      fact.amount.length > 0,
  );
}

export function getFormulaPublicationState(
  facts: readonly IngredientFact[],
): FormulaPublicationState {
  const publishableFacts = getPublishableIngredients(facts);
  if (publishableFacts.length === 0) return "blocked";
  return facts.some((fact) => fact.status !== "confirmed")
    ? "partial"
    : "confirmed";
}

export const formulaPublicationState =
  getFormulaPublicationState(ingredientFacts);
