export type LegalDocumentStatus = "draft" | "approved" | "blocked";

export interface LegalDocumentSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface LegalDocument {
  readonly id: "privacy" | "terms" | "refunds";
  readonly path: string;
  readonly title: string;
  readonly navigationLabel: string;
  readonly metaDescription: string;
  readonly status: LegalDocumentStatus;
  readonly sections?: readonly LegalDocumentSection[];
}

export const legalDocuments: readonly LegalDocument[] = [
  {
    id: "privacy",
    path: "/politica-de-privacidade",
    title: "Política de Privacidade",
    navigationLabel: "Política de Privacidade",
    metaDescription:
      "Estrutura da Política de Privacidade da Belvitale, disponível somente após aprovação jurídica.",
    status: "draft",
  },
  {
    id: "terms",
    path: "/termos-de-uso",
    title: "Termos de Uso",
    navigationLabel: "Termos de Uso",
    metaDescription:
      "Estrutura dos Termos de Uso da Belvitale, disponível somente após aprovação jurídica.",
    status: "draft",
  },
  {
    id: "refunds",
    path: "/trocas-e-reembolso",
    title: "Política de Trocas e Reembolso",
    navigationLabel: "Política de Trocas e Reembolso",
    metaDescription:
      "Estrutura da Política de Trocas e Reembolso da Belvitale, disponível somente após aprovação jurídica.",
    status: "draft",
  },
];

export function canPublishLegalDocument(document: LegalDocument): boolean {
  return (
    document.status === "approved" &&
    document.sections !== undefined &&
    document.sections.length > 0
  );
}

export function getPublicLegalDocuments(): readonly LegalDocument[] {
  return legalDocuments.filter(canPublishLegalDocument);
}

export function getLegalDocumentByPath(pathname: string): LegalDocument | null {
  return legalDocuments.find((document) => document.path === pathname) ?? null;
}

export type LegalRouteMode = "approved" | "internal-draft" | "unavailable";

export function getLegalRouteMode(
  document: LegalDocument,
  isDevelopment: boolean,
): LegalRouteMode {
  if (canPublishLegalDocument(document)) return "approved";
  return isDevelopment ? "internal-draft" : "unavailable";
}
