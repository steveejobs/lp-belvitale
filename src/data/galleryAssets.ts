import {
  campaignAssets,
  canRenderCampaignAsset,
  internalMediaPreview,
  type CampaignAsset,
} from "./campaignAssets";
import { proofAssets } from "./proofGallery";

export type GalleryAssetGroup =
  | "brand"
  | "product"
  | "routine"
  | "proof"
  | "label"
  | "kit";

export interface GalleryAsset {
  readonly id: string;
  readonly group: GalleryAssetGroup;
  readonly title: string;
  readonly kicker: string;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly sourceFile: string;
  readonly availability: "public" | "internal-preview";
}

const brandAssets: readonly GalleryAsset[] = [
  {
    id: "brand-monogram-square",
    group: "brand",
    title: "Monograma Belvitale",
    kicker: "Marca",
    src: "/brand/belvitale-monogram-square.webp",
    width: 500,
    height: 500,
    alt: "Monograma quadrado da Belvitale.",
    sourceFile: "BV belvitale.png",
    availability: "public",
  },
  {
    id: "brand-wordmark-dark",
    group: "brand",
    title: "Assinatura escura",
    kicker: "Marca",
    src: "/brand/belvitale-wordmark-dark.webp",
    width: 496,
    height: 369,
    alt: "Assinatura Belvitale em versao escura.",
    sourceFile: "belvitale sem fundo preto.png",
    availability: "public",
  },
  {
    id: "brand-wordmark-light",
    group: "brand",
    title: "Assinatura clara",
    kicker: "Marca",
    src: "/brand/belvitale-wordmark-light.webp",
    width: 2508,
    height: 627,
    alt: "Assinatura Belvitale em versao clara.",
    sourceFile: "belvitale sem fundo branco.png",
    availability: "public",
  },
  {
    id: "brand-monogram-dark",
    group: "brand",
    title: "Simbolo escuro",
    kicker: "Marca",
    src: "/brand/belvitale-monogram-dark.webp",
    width: 537,
    height: 400,
    alt: "Simbolo Belvitale em versao escura.",
    sourceFile: "logo sem fundo preta.png",
    availability: "public",
  },
  {
    id: "brand-monogram-light",
    group: "brand",
    title: "Simbolo claro",
    kicker: "Marca",
    src: "/brand/belvitale-monogram-light.webp",
    width: 546,
    height: 480,
    alt: "Simbolo Belvitale em versao clara.",
    sourceFile: "logo sem fundo branca.png",
    availability: "public",
  },
];

function fromCampaignAsset(
  asset: CampaignAsset,
  metadata: Pick<GalleryAsset, "group" | "title" | "kicker" | "sourceFile">,
): GalleryAsset {
  return {
    id: asset.id,
    group: metadata.group,
    title: metadata.title,
    kicker: metadata.kicker,
    src: asset.src,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
    sourceFile: metadata.sourceFile,
    availability:
      asset.status === "approved" || asset.status === "owner-authorized"
        ? "public"
        : "internal-preview",
  };
}

const productAssets: readonly GalleryAsset[] = [
  fromCampaignAsset(campaignAssets.productFrontPrimary, {
    group: "product",
    title: "Frasco em foco",
    kicker: "Produto",
    sourceFile: "publicproductceluclin-front (2).png",
  }),
  fromCampaignAsset(campaignAssets.productFrontClose, {
    group: "product",
    title: "Frente aproximada",
    kicker: "Produto",
    sourceFile: "publicproductceluclin-front (1).png",
  }),
  fromCampaignAsset(campaignAssets.productAngle, {
    group: "product",
    title: "Angulo editorial",
    kicker: "Produto",
    sourceFile: "publicproductceluclin-angle.webp.png",
  }),
  fromCampaignAsset(campaignAssets.productInHand, {
    group: "routine",
    title: "Na mao",
    kicker: "Rotina",
    sourceFile: "publicproductceluclin-hand.webp.png",
  }),
  fromCampaignAsset(campaignAssets.capsules, {
    group: "product",
    title: "Capsulas",
    kicker: "Formula",
    sourceFile: "publicproductcapsules.webp.png",
  }),
  fromCampaignAsset(campaignAssets.lifestyleFreedom, {
    group: "routine",
    title: "Liberdade",
    kicker: "Rotina",
    sourceFile: "publiclifestylefreedom-01.webp.png",
  }),
  {
    id: "lifestyle-hero",
    group: "routine",
    title: "Cena de campanha",
    kicker: "Rotina",
    src: campaignAssets.lifestyleHero.src,
    width: 1122,
    height: 1402,
    alt: "Cena editorial da campanha CeluClin em fundo claro.",
    sourceFile: "publiclifestylehero.webp.png",
    availability: "public",
  },
  fromCampaignAsset(campaignAssets.lifestyleRoutine, {
    group: "routine",
    title: "Ritual simples",
    kicker: "Rotina",
    sourceFile: "publiclifestyleroutine-01.webp.png",
  }),
];

export const checkoutGalleryAssets: readonly GalleryAsset[] = [
  {
    id: "kit-one-month",
    group: "kit",
    title: "Kit 1 mes",
    kicker: "Kit",
    src: "/checkout/celuclin-kit-01-month-yampi.png",
    width: 290,
    height: 314,
    alt: "Imagem de checkout do kit CeluClin de 1 mes.",
    sourceFile: "checkout-assets/celuclin-kit-01-month-yampi.png",
    availability: "internal-preview",
  },
  {
    id: "kit-three-months",
    group: "kit",
    title: "Kit 3 meses",
    kicker: "Kit",
    src: "/checkout/celuclin-kit-03-months-yampi.png",
    width: 290,
    height: 329,
    alt: "Imagem de checkout do kit CeluClin de 3 meses.",
    sourceFile: "checkout-assets/celuclin-kit-03-months-yampi.png",
    availability: "internal-preview",
  },
  {
    id: "kit-seven-months",
    group: "kit",
    title: "Kit 7 meses",
    kicker: "Kit",
    src: "/checkout/celuclin-kit-07-months-yampi.png",
    width: 290,
    height: 289,
    alt: "Imagem de checkout do kit CeluClin de 7 meses.",
    sourceFile: "checkout-assets/celuclin-kit-07-months-yampi.png",
    availability: "internal-preview",
  },
];

const proofGalleryAssets: readonly GalleryAsset[] = proofAssets.map((asset) => ({
  id: asset.id,
  group: "proof",
  title: asset.sequenceLabel.replace("Registro", "Imagem"),
  kicker:
    asset.category === "cellulite"
      ? "Celulite"
      : asset.category === "laxity"
        ? "Flacidez"
        : "Gordura localizada",
  src: asset.src,
  width: asset.width,
  height: asset.height,
  alt: asset.alt,
  sourceFile: asset.sourceFile,
  availability: "public",
}));

function canRenderGalleryAsset(asset: GalleryAsset): boolean {
  if (asset.availability === "public") return asset.src.length > 0;
  if (!internalMediaPreview) return false;

  const campaignAsset = Object.values(campaignAssets).find(
    (candidate) => candidate.src === asset.src,
  );

  return campaignAsset === undefined || canRenderCampaignAsset(campaignAsset);
}

export function getGalleryAssets(): readonly GalleryAsset[] {
  return [
    ...brandAssets,
    ...productAssets,
    ...proofGalleryAssets,
    ...checkoutGalleryAssets,
  ].filter(canRenderGalleryAsset);
}
