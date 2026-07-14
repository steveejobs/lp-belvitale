export type CommercialSurfaceStatus = "confirmed" | "pending" | "blocked";

export const commercialSurfaceGate = {
  offerTerms: "pending",
  productMedia: "blocked",
  mediaRights: "pending",
  refundPolicy: "pending",
  institutionalIdentification: "pending",
  sanitaryStatus: "pending",
} as const satisfies Readonly<Record<string, CommercialSurfaceStatus>>;

/**
 * Gate factual e deliberadamente literal. Só muda para true quando cada
 * dependência acima estiver confirmada na fonte da verdade.
 */
export function isCommercialSurfaceReady(
  gate: Readonly<Record<string, CommercialSurfaceStatus>>,
): boolean {
  return Object.values(gate).every((status) => status === "confirmed");
}

export const commercialSurfaceReady =
  isCommercialSurfaceReady(commercialSurfaceGate);
