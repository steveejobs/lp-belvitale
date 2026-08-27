export type CampaignAssetStatus =
  | "approved"
  | "owner-authorized"
  | "internal-review"
  | "blocked";

export type CampaignAssetKind =
  | "product"
  | "capsules"
  | "lifestyle"
  | "brand";

export interface CampaignAsset {
  readonly id: string;
  readonly kind: CampaignAssetKind;
  readonly src: string;
  readonly mobileSrc?: string;
  readonly mobileAvifSrc?: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly status: CampaignAssetStatus;
  readonly productionNote: string;
  readonly dominantColor: string;
}

export const internalMediaPreview =
  import.meta.env.DEV || import.meta.env.VITE_INTERNAL_MEDIA === "true";

export const campaignAssets = {
  productFrontPrimary: {
    id: "product-front-primary",
    kind: "product",
    src: "/product/celuclin-front-02.webp",
    mobileSrc: "/product/celuclin-front-02-hero-mobile.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em vista frontal, sobre fundo claro.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#E6C1B0",
  },
  productFrontClose: {
    id: "product-front-close",
    kind: "product",
    src: "/product/celuclin-front-01.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em enquadramento frontal aproximado.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#E8C8B7",
  },
  productAngle: {
    id: "product-angle",
    kind: "product",
    src: "/product/celuclin-angle.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em ângulo, iluminado sobre fundo ameixa.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#3D2E39",
  },
  productInHand: {
    id: "product-in-hand",
    kind: "product",
    src: "/product/celuclin-hand.webp",
    width: 1122,
    height: 1402,
    alt: "Mão segurando um frasco CeluClin em ambiente iluminado.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#D8B49E",
  },
  capsules: {
    id: "capsules",
    kind: "capsules",
    src: "/product/celuclin-capsules.webp",
    width: 1122,
    height: 1402,
    alt: "Cápsulas avermelhadas sobre uma superfície mineral clara.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#A6141D",
  },
  lifestyleFreedom: {
    id: "lifestyle-freedom",
    kind: "lifestyle",
    src: "/lifestyle/freedom-01.webp",
    width: 1122,
    height: 1402,
    alt: "Cena editorial de uma mulher adulta junto a uma janela iluminada.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#EDE2D9",
  },
  lifestyleConfidence: {
    id: "lifestyle-confidence",
    kind: "lifestyle",
    src: "/lifestyle/confidence-hero.webp",
    mobileSrc: "/lifestyle/confidence-hero-640.webp",
    width: 992,
    height: 1056,
    alt: "Cena editorial ilustrativa de uma mulher adulta sentada, segurando um frasco CeluClin.",
    status: "owner-authorized",
    productionNote:
      "Imagem enviada e autorizada pelo proprietário para a reformulação da homepage em 27/08/2026.",
    dominantColor: "#4A3934",
  },
  lifestyleRoutine: {
    id: "lifestyle-routine",
    kind: "lifestyle",
    src: "/lifestyle/routine-01.webp",
    width: 1122,
    height: 1402,
    alt: "Cena editorial de uma mulher servindo água em um copo.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#B58E72",
  },
  lifestyleHero: {
    id: "lifestyle-hero",
    kind: "lifestyle",
    src: "/lifestyle/celuclin-hero.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em uma composição editorial clara com folhas.",
    status: "owner-authorized",
    productionNote:
      "Uso visual autorizado pelo proprietário para a homepage em 15/07/2026.",
    dominantColor: "#D9B9B0",
  },
} as const satisfies Readonly<Record<string, CampaignAsset>>;

export function canRenderCampaignAsset(asset: CampaignAsset): boolean {
  return (
    asset.status === "approved" ||
    asset.status === "owner-authorized" ||
    (asset.status === "internal-review" && internalMediaPreview)
  );
}
