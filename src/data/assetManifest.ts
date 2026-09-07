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
  { path: "/brand/belvitale-monogram-light.webp", classification: "logo", width: 546, height: 480, usage: "active" },
  { path: "/brand/belvitale-wordmark-dark.webp", classification: "logo", width: 496, height: 369, usage: "active" },
  { path: "/brand/belvitale-wordmark-editorial.webp", classification: "logo", width: 440, height: 115, usage: "active", note: "Recorte limpo do wordmark enviado pelo proprietário para o cabeçalho compacto do quiz." },
  { path: "/brand/belvitale-wordmark-light.webp", classification: "logo", width: 2508, height: 627, usage: "active" },
  { path: "/brand/belvitale-monogram-black-transparent.png", classification: "logo", width: 1005, height: 1005, usage: "active", note: "Monograma enviado pelo proprietário, com fundo removido e bordas limpas para favicon e rodapés." },
  { path: "/brand/belvitale-wordmark-quiz.png", classification: "logo", width: 1960, height: 300, usage: "active", note: "Wordmark enviado pelo proprietário, alinhado e recortado sem fundo para o cabeçalho do quiz." },
  { path: "/product/celuclin-front-02.webp", classification: "front-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-front-02-hero-mobile.webp", classification: "front-bottle", width: 768, height: 606, usage: "responsive-variant", duplicateOf: "/product/celuclin-front-02.webp", note: "Recorte editorial sem alteracao do produto, gerado por tools/optimize_images.py." },
  { path: "/product/celuclin-front-01.webp", classification: "front-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-front-01-768.webp", classification: "front-bottle", width: 768, height: 960, usage: "responsive-variant", duplicateOf: "/product/celuclin-front-01.webp" },
  { path: "/product/celuclin-front-02-640.webp", classification: "inadequate-or-duplicate", width: 640, height: 800, usage: "unused", duplicateOf: "/product/celuclin-front-02.webp", note: "Derivada antiga fora do srcset atual." },
  { path: "/product/celuclin-angle.webp", classification: "angled-bottle", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-angle-768.webp", classification: "angled-bottle", width: 768, height: 960, usage: "responsive-variant", duplicateOf: "/product/celuclin-angle.webp" },
  { path: "/product/celuclin-hand.webp", classification: "product-in-hand", width: 1122, height: 1402, usage: "active" },
  { path: "/product/celuclin-capsules.webp", classification: "capsules", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/celuclin-hero.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/freedom-01.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/freedom-01-768.webp", classification: "lifestyle", width: 768, height: 960, usage: "responsive-variant", duplicateOf: "/lifestyle/freedom-01.webp" },
  { path: "/lifestyle/confidence-hero.webp", classification: "lifestyle", width: 992, height: 1056, usage: "active", note: "Cena editorial ilustrativa enviada e autorizada pelo proprietário em 27/08/2026." },
  { path: "/lifestyle/confidence-hero-640.webp", classification: "lifestyle", width: 640, height: 681, usage: "responsive-variant", duplicateOf: "/lifestyle/confidence-hero.webp" },
  { path: "/lifestyle/quiz-hero-confidence.jpg", classification: "lifestyle", width: 864, height: 1821, usage: "active", note: "Cena editorial vertical criada para a abertura mobile do quiz, sem produto, texto ou marca d'água." },
  { path: "/lifestyle/quiz-desire-01.webp", classification: "lifestyle", width: 992, height: 1056, usage: "active", note: "Derivada WebP otimizada; o enquadramento da interface exclui a assinatura inferior." },
  { path: "/lifestyle/quiz-desire-02.webp", classification: "lifestyle", width: 960, height: 1088, usage: "active", note: "Derivada WebP otimizada; o enquadramento da interface exclui a assinatura inferior." },
  { path: "/lifestyle/quiz-desire-03.webp", classification: "lifestyle", width: 992, height: 1056, usage: "active", note: "Derivada WebP otimizada; o enquadramento da interface exclui a assinatura inferior." },
  { path: "/lifestyle/routine-01.webp", classification: "lifestyle", width: 1122, height: 1402, usage: "active" },
  { path: "/lifestyle/celuclin-self-care.webp", classification: "lifestyle", width: 720, height: 783, usage: "active", note: "Cena enviada pelo proprietário e recortada sem retoque corporal para o insight e a transição do resultado." },
  { path: "/offers/celuclin-one.webp", classification: "kit", width: 800, height: 700, usage: "unused", note: "Composição local anterior, preservada para histórico." },
  { path: "/offers/celuclin-three.webp", classification: "kit", width: 1000, height: 700, usage: "unused", note: "Composição local anterior, preservada para histórico." },
  { path: "/offers/celuclin-seven.webp", classification: "kit", width: 1200, height: 760, usage: "unused", note: "Composição local anterior, preservada para histórico." },
  { path: "/offers/celuclin-one-editorial.webp", classification: "kit", width: 683, height: 740, usage: "active", note: "Composição ilustrativa de 1 frasco enviada pelo proprietário." },
  { path: "/offers/celuclin-three-editorial.webp", classification: "kit", width: 686, height: 778, usage: "active", note: "Composição ilustrativa de 3 frascos enviada pelo proprietário." },
  { path: "/offers/celuclin-seven-editorial.webp", classification: "kit", width: 720, height: 717, usage: "active", note: "Composição ilustrativa de 7 frascos, organizados como 5 + 2, enviada pelo proprietário." },
  { path: "/proof/cellulite/cellulite-01.webp", classification: "cellulite", width: 1254, height: 1254, usage: "active" },
  { path: "/proof/cellulite/cellulite-02.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/cellulite/cellulite-03.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/cellulite/cellulite-04.webp", classification: "cellulite", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/cellulite/cellulite-05.jpg", classification: "cellulite", width: 1024, height: 411, usage: "active" },
  { path: "/proof/cellulite/cellulite-06.jpg", classification: "cellulite", width: 1080, height: 1080, usage: "active" },
  { path: "/proof/cellulite/cellulite-07.jpg", classification: "cellulite", width: 998, height: 559, usage: "active" },
  { path: "/proof/cellulite/cellulite-08.jpg", classification: "cellulite", width: 864, height: 666, usage: "active" },
  { path: "/proof/cellulite/cellulite-09.jpg", classification: "cellulite", width: 1278, height: 798, usage: "active" },
  { path: "/proof/laxity/laxity-01.webp", classification: "laxity", width: 1254, height: 1254, usage: "active" },
  { path: "/proof/laxity/laxity-02.webp", classification: "laxity", width: 1373, height: 1145, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-01.webp", classification: "localized-fat", width: 1537, height: 1023, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-02.webp", classification: "localized-fat", width: 1448, height: 1086, usage: "active" },
  { path: "/proof/localized-fat/localized-fat-03.webp", classification: "localized-fat", width: 1448, height: 1086, usage: "active" },
  { path: "/label/celuclin-label-front.webp", classification: "label", width: 1310, height: 621, usage: "label-only" },
  { path: "/label/celuclin-label-complete.pdf", classification: "label", width: null, height: null, usage: "label-only" },
] as const;
