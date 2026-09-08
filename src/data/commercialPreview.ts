import { withFunnelAttribution } from "../analytics/funnelAttribution";
import {
  commercialOffers,
  commercialPublicationReady,
  isValidCheckoutUrl,
} from "./commercialOffers";

const allowedUtmParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const checkoutAudit = {
  verifiedAt: "2026-07-15",
  browser: "Google Chrome em contexto limpo",
  offers: {
    "one-month": {
      finalUrl:
        "https://belvitale.pay.yampi.com.br/checkout?skipToCheckout=1&tokenReference=PWJOI4I112",
      status: 200,
      cartProduct: "CeluClin 1 Mês (1 pote)",
      image: {
        src: "https://images.yampi.me/assets/stores/belvitale/uploads/images/celuclin-1-mes-1-pote-68d06735c8838-thumb.png",
        width: 290,
        height: 314,
        bytes: 63745,
        rights: "Origem oficial do checkout; direito de republicação não documentado.",
        publication: "Somente auditoria; não publicada na interface.",
      },
    },
    "three-months": {
      finalUrl:
        "https://belvitale.pay.yampi.com.br/checkout?skipToCheckout=1&tokenReference=1E8NNCGJW9",
      status: 200,
      cartProduct: "CeluClin 3 Meses (3 potes)",
      image: {
        src: "https://images.yampi.me/assets/stores/belvitale/uploads/images/celuclin-3-meses-3-potes-68d1be4269d32-thumb.png",
        width: 290,
        height: 329,
        bytes: 89694,
        rights: "Origem oficial do checkout; direito de republicação não documentado.",
        publication: "Somente auditoria; não publicada na interface.",
      },
    },
    "seven-months": {
      finalUrl:
        "https://belvitale.pay.yampi.com.br/checkout?skipToCheckout=1&tokenReference=41CHX4MGPX",
      status: 200,
      cartProduct: "CeluClin 7 Meses (5 + 2 grátis)",
      image: {
        src: "https://images.yampi.me/assets/stores/belvitale/uploads/images/celuclin-7-meses-5-2-gratis-68d1bf5f6553e-thumb.png",
        width: 290,
        height: 289,
        bytes: 84412,
        rights: "Origem oficial do checkout; direito de republicação não documentado.",
        publication: "Somente auditoria; não publicada na interface.",
      },
    },
  },
} as const;

const checkoutAuditReady = commercialOffers.every((offer) => {
  const audit = checkoutAudit.offers[offer.id];
  return (
    offer.checkoutStatus === "confirmed" &&
    isValidCheckoutUrl(offer.checkoutUrl) &&
    audit.cartProduct.length > 0
  );
});

const commercialEnvironment = import.meta.env as ImportMetaEnv | undefined;
const commercialPreviewEnabled =
  commercialEnvironment?.DEV === true ||
  commercialEnvironment?.VITE_COMMERCIAL_PREVIEW === "enabled";

export const commercialPreviewReady =
  commercialPreviewEnabled && checkoutAuditReady;
export const commercialNavigationReady =
  commercialPublicationReady || commercialPreviewReady;

export function getCheckoutUrlWithUtms(
  checkoutUrl: string,
  currentSearch = window.location.search,
): string {
  const target = new URL(checkoutUrl);
  const source = new URLSearchParams(currentSearch);

  allowedUtmParameters.forEach((parameter) => {
    const value = source.get(parameter);
    if (value !== null && value.trim().length > 0) {
      target.searchParams.set(parameter, value);
    }
  });

  return withFunnelAttribution(target.toString(), true);
}
