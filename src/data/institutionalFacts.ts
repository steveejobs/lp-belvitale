export type InstitutionalFactStatus = "confirmed" | "pending" | "blocked";

export interface InstitutionalFact {
  readonly value?: string;
  readonly status: InstitutionalFactStatus;
  readonly source?: string;
}

export interface InstitutionalFacts {
  readonly legalName: InstitutionalFact;
  readonly tradeName: InstitutionalFact;
  readonly cnpj: InstitutionalFact;
  readonly email: InstitutionalFact;
  readonly phone: InstitutionalFact;
  readonly whatsapp: InstitutionalFact;
  readonly address: InstitutionalFact;
  readonly city: InstitutionalFact;
  readonly state: InstitutionalFact;
  readonly manufacturer: InstitutionalFact;
  readonly responsibleProfessional: InstitutionalFact;
  readonly canonicalUrl: InstitutionalFact;
}

export const institutionalFacts: InstitutionalFacts = {
  legalName: { status: "pending" },
  tradeName: { status: "pending" },
  cnpj: {
    value: "61.493.515/0001-65",
    status: "confirmed",
    source: "Informado diretamente pelo usuário em 14/07/2026.",
  },
  email: { status: "pending" },
  phone: {
    value: "(63) 99108-1785",
    status: "confirmed",
    source: "Informado diretamente pelo usuário como SAC em 14/07/2026.",
  },
  whatsapp: { status: "pending" },
  address: { status: "pending" },
  city: { status: "pending" },
  state: { status: "pending" },
  manufacturer: { status: "blocked" },
  responsibleProfessional: { status: "blocked" },
  canonicalUrl: { status: "pending" },
};

export function isConfirmedInstitutionalFact(
  fact: InstitutionalFact,
): fact is InstitutionalFact & { readonly value: string } {
  return (
    fact.status === "confirmed" &&
    fact.value !== undefined &&
    fact.value.trim().length > 0
  );
}

export function getTelephoneHref(fact: InstitutionalFact): string | null {
  if (!isConfirmedInstitutionalFact(fact)) return null;
  const digits = fact.value.replace(/\D/g, "");
  return digits.length === 11 ? `tel:+55${digits}` : null;
}
