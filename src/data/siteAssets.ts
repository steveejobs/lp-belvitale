export type AssetStatus = "approved" | "pending" | "blocked";

interface ApprovedAsset {
  readonly status: "approved";
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

interface UnavailableAsset {
  readonly status: "pending" | "blocked";
  readonly src: null;
}

export type SiteAsset = ApprovedAsset | UnavailableAsset;

export const institutionalAssets: Readonly<{
  productPackshot: SiteAsset;
  brandLogo: SiteAsset;
  labelArtwork: SiteAsset;
}> = {
  productPackshot: {
    status: "blocked",
    src: null,
  },
  brandLogo: {
    status: "pending",
    src: null,
  },
  labelArtwork: {
    status: "approved",
    src: "/label/celuclin-label-front.webp",
    width: 1310,
    height: 621,
    alt: "Arte plana completa do rótulo do suplemento alimentar CeluClin",
  },
};

export function isApprovedAsset(asset: SiteAsset): asset is ApprovedAsset {
  return asset.status === "approved";
}
