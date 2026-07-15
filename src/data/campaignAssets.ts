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
    mobileSrc: "/product/celuclin-front-02-640.webp",
    mobileAvifSrc: "/product/celuclin-front-02-640.avif",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em vista frontal, sobre fundo claro.",
    status: "internal-review",
    productionNote:
      "O texto miúdo visível diverge da arte oficial; uso restrito ao preview interno.",
    dominantColor: "#E6C1B0",
  },
  productFrontClose: {
    id: "product-front-close",
    kind: "product",
    src: "/product/celuclin-front-01.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em enquadramento frontal aproximado.",
    status: "internal-review",
    productionNote:
      "O texto miúdo visível diverge da arte oficial; uso restrito ao preview interno.",
    dominantColor: "#E8C8B7",
  },
  productAngle: {
    id: "product-angle",
    kind: "product",
    src: "/product/celuclin-angle.webp",
    width: 1122,
    height: 1402,
    alt: "Frasco CeluClin em ângulo, iluminado sobre fundo ameixa.",
    status: "internal-review",
    productionNote:
      "O texto miúdo visível diverge da arte oficial; uso restrito ao preview interno.",
    dominantColor: "#3D2E39",
  },
  productInHand: {
    id: "product-in-hand",
    kind: "product",
    src: "/product/celuclin-hand.webp",
    width: 1122,
    height: 1402,
    alt: "Mão segurando um frasco CeluClin em ambiente iluminado.",
    status: "internal-review",
    productionNote:
      "O texto miúdo visível diverge da arte oficial; uso restrito ao preview interno.",
    dominantColor: "#D8B49E",
  },
  capsules: {
    id: "capsules",
    kind: "capsules",
    src: "/product/celuclin-capsules.webp",
    width: 1122,
    height: 1402,
    alt: "Cápsulas avermelhadas sobre uma superfície mineral clara.",
    status: "internal-review",
    productionNote:
      "A associação das cápsulas ao produto ainda depende da validação documental do asset.",
    dominantColor: "#A6141D",
  },
  lifestyleFreedom: {
    id: "lifestyle-freedom",
    kind: "lifestyle",
    src: "/lifestyle/freedom-01.webp",
    width: 1122,
    height: 1402,
    alt: "Cena editorial de uma mulher adulta junto a uma janela iluminada.",
    status: "internal-review",
    productionNote:
      "Lifestyle ilustrativo; direitos e procedência permanecem em revisão.",
    dominantColor: "#EDE2D9",
  },
  lifestyleRoutine: {
    id: "lifestyle-routine",
    kind: "lifestyle",
    src: "/lifestyle/routine-01.webp",
    width: 1122,
    height: 1402,
    alt: "Cena editorial de uma mulher servindo água em um copo.",
    status: "internal-review",
    productionNote:
      "Lifestyle ilustrativo; direitos e procedência permanecem em revisão.",
    dominantColor: "#B58E72",
  },
} as const satisfies Readonly<Record<string, CampaignAsset>>;

export function canRenderCampaignAsset(asset: CampaignAsset): boolean {
  return (
    asset.status === "approved" ||
    asset.status === "owner-authorized" ||
    (asset.status === "internal-review" && internalMediaPreview)
  );
}
