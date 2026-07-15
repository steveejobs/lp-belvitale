export type AssetClassification =
  | "logo"
  | "front-bottle"
  | "angled-bottle"
  | "product-in-hand"
  | "capsules"
  | "lifestyle"
  | "cellulite"
  | "laxity"
  | "localized-fat"
  | "label"
  | "kit"
  | "inadequate-or-duplicate";

export type AssetUsage =
  | "active"
  | "responsive-variant"
  | "label-only"
  | "audit-only"
  | "unused";

export interface AuditedAsset {
  readonly path: string;
  readonly classification: AssetClassification;
  readonly width: number | null;
  readonly height: number | null;
  readonly usage: AssetUsage;
  readonly duplicateOf?: string;
  readonly note?: string;
}

export const auditedAssetManifest: readonly AuditedAsset[] = [
  { path: "/brand/belvitale-monogram-dark.webp", classification: "logo", width: 537, height: 400, usage: "active" },
  { path: "/brand/belvitale-monogram-light.webp", classification: "logo", width: 546, height: 480, usage: "active" },
  { path: "/brand/belvitale-wordmark-dark.webp", classification: "logo", width: 496, height: 369, usage: "active" },
  { path: "/brand/belvitale-wordmark-light.webp", classification: "logo", width: 2508, height: 627, usage: "active" },
  {
    path: "/brand/belvitale-monogram-square.webp",
    classification: "inadequate-or-duplicate",
    width: 500,
    height: 500,
    usage: "unused",
    duplicateOf: "/brand/belvitale-monogram-dark.webp",
    note: "Monograma escuro repetido sobre fundo claro.",
  },
  { path: "/product/celuclin-front-02.webp", classification: "front-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-front-01.webp", classification: "front-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-front-02-640.webp", classification: "front-bottle", width: 640, height: 800, usage: "responsive-variant", duplicateOf: "/product/celuclin-front-02.webp" },
  { path: "/product/celuclin-front-02-640.avif", classification: "front-bottle", width: 640, height: 800, usage: "responsive-variant", duplicateOf: "/product/celuclin-front-02.webp" },
  { path: "/product/celuclin-angle.webp", classification: "angled-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-hand.webp", classification: "product-in-hand", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-capsules.webp", classification: "capsules", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/celuclin-hero.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/freedom-01.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/routine-01.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/offers/celuclin-one.webp", classification: "kit", width: 800, height: 700, usage: "active", note: "Composição local com o packshot frontal original." },
  { path: "/offers/celuclin-three.webp", classification: "kit", width: 1000, height: 700, usage: "active", note: "Composição local com três instâncias do packshot frontal original." },
  { path: "/offers/celuclin-seven.webp", classification: "kit", width: 1200, height: 760, usage: "active", note: "Composição local com sete instâncias do packshot frontal original, organizadas como 5 + 2." },
  { path: "/proof/cellulite/cellulite-01.webp", classification: "cellulite", width: 1254, height: 1254, usage: "active" },
  { path: "/proof/cellulite/cellulite-02.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/cellulite/cellulite-03.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/cellulite/cellulite-04.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/laxity/laxity-01.webp", classification: "laxity", width: 1254, height: 1254, usage: "active" },
  { path: "/proof/laxity/laxity-02.webp", classification: "laxity", width: 1373, height: 1145, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-01.webp", classification: "localized-fat", width: 1537, height: 1023, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-02.webp", classification: "localized-fat", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-03.webp", classification: "localized-fat", width: 1448, height: 1086, usage: "active" },
  { path: "/label/celuclin-label-front.webp", classification: "label", width: 1310, height: 621, usage: "label-only" },
  { path: "/label/celuclin-label-complete.pdf", classification: "label", width: null, height: null, usage: "label-only" },
  {
    path: "/checkout/celuclin-kit-01-month-yampi.png",
    classification: "kit",
    width: 290,
    height: 314,
    usage: "audit-only",
    note: "Miniatura oficial; não ampliar nem publicar sem confirmação de direitos.",
  },
  {
    path: "/checkout/celuclin-kit-03-months-yampi.png",
    classification: "kit",
    width: 290,
    height: 329,
    usage: "audit-only",
    note: "Miniatura oficial; não ampliar nem publicar sem confirmação de direitos.",
  },
  {
    path: "/checkout/celuclin-kit-07-months-yampi.png",
    classification: "kit",
    width: 290,
    height: 289,
    usage: "audit-only",
    note: "Miniatura oficial; não ampliar nem publicar sem confirmação de direitos.",
  },
] as const;
