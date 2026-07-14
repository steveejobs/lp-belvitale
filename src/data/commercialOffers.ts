import {
  legalDocuments,
  type LegalDocumentStatus,
} from "./legalDocuments";
import { commercialSurfaceReady } from "./commercialPublicationGate";
import { regulatoryPublicationReady } from "./regulatoryFacts";

export type CommercialStatus =
  | "confirmed"
  | "pending"
  | "conflicting"
  | "blocked";

export interface CommercialPrice {
  readonly cash?: number;
  readonly installments?: number;
  readonly installmentValue?: number;
  readonly hasInterest?: boolean;
  readonly status: CommercialStatus;
}

export interface CommercialAsset {
  readonly src?: string;
  readonly width?: number;
  readonly height?: number;
  readonly rightsConfirmed: boolean;
  readonly resolutionApproved: boolean;
  readonly status: CommercialStatus;
}

export interface CommercialOffer {
  readonly id: "one-month" | "three-months" | "seven-months";
  readonly title: string;
  readonly bottles: number;
  readonly approximateDurationMonths: number;
  readonly additionalBottles?: number;
  readonly totalCapsules: number;
  readonly checkoutUrl: string;
  readonly checkoutStatus: CommercialStatus;
  readonly contentsStatus: CommercialStatus;
  readonly price: CommercialPrice;
  readonly image: CommercialAsset;
  readonly publicationStatus: CommercialStatus;
}

export interface CommercialPublicationDependencies {
  readonly refundPolicyStatus: LegalDocumentStatus;
  readonly institutionalIdentificationStatus: CommercialStatus;
}

const checkoutHost = "belvitale.pay.yampi.com.br";
const checkoutPathPattern = /^\/r\/[A-Z0-9]+$/;

export const commercialOffers: readonly CommercialOffer[] = [
  {
    id: "one-month",
    title: "1 mês",
    bottles: 1,
    approximateDurationMonths: 1,
    totalCapsules: 60,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/PWJOI4I112",
    checkoutStatus: "confirmed",
    contentsStatus: "confirmed",
    price: { status: "pending" },
    image: {
      width: 290,
      height: 314,
      rightsConfirmed: false,
      resolutionApproved: false,
      status: "blocked",
    },
    publicationStatus: "pending",
  },
  {
    id: "three-months",
    title: "3 meses",
    bottles: 3,
    approximateDurationMonths: 3,
    totalCapsules: 180,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/1E8NNCGJW9",
    checkoutStatus: "confirmed",
    contentsStatus: "confirmed",
    price: { status: "pending" },
    image: {
      width: 290,
      height: 329,
      rightsConfirmed: false,
      resolutionApproved: false,
      status: "blocked",
    },
    publicationStatus: "pending",
  },
  {
    id: "seven-months",
    title: "7 meses",
    bottles: 5,
    additionalBottles: 2,
    approximateDurationMonths: 7,
    totalCapsules: 420,
    checkoutUrl: "https://belvitale.pay.yampi.com.br/r/41CHX4MGPX",
    checkoutStatus: "confirmed",
    contentsStatus: "confirmed",
    price: { status: "pending" },
    image: {
      width: 290,
      height: 289,
      rightsConfirmed: false,
      resolutionApproved: false,
      status: "blocked",
    },
    publicationStatus: "pending",
  },
] as const;

function toExactCents(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const cents = value * 100;
  const roundedCents = Math.round(cents);
  return Math.abs(cents - roundedCents) < 1e-7
    ? roundedCents
    : null;
}

export function calculatePricePerBottle(
  totalPrice: number | undefined,
  bottles: number | undefined,
): number | null {
  const totalCents = toExactCents(totalPrice);
  if (
    totalCents === null ||
    bottles === undefined ||
    !Number.isInteger(bottles) ||
    bottles <= 0 ||
    totalCents % bottles !== 0
  ) {
    return null;
  }

  return totalCents / bottles / 100;
}

export function calculateInstallmentTotal(
  installments: number | undefined,
  installmentValue: number | undefined,
): number | null {
  const installmentCents = toExactCents(installmentValue);
  if (
    installments === undefined ||
    !Number.isInteger(installments) ||
    installments <= 0 ||
    installmentCents === null ||
    !Number.isSafeInteger(installmentCents * installments)
  ) {
    return null;
  }

  return (installmentCents * installments) / 100;
}

export function calculateVerifiedSavings(
  referencePrice: number | undefined,
  currentPrice: number | undefined,
): number | null {
  const referenceCents = toExactCents(referencePrice);
  const currentCents = toExactCents(currentPrice);
  if (
    referenceCents === null ||
    currentCents === null ||
    currentCents >= referenceCents
  ) {
    return null;
  }

  return (referenceCents - currentCents) / 100;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getOfferTotalBottles(offer: CommercialOffer): number {
  return offer.bottles + (offer.additionalBottles ?? 0);
}

export function isValidCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === checkoutHost &&
      checkoutPathPattern.test(url.pathname) &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

function hasConfirmedPrice(price: CommercialPrice): boolean {
  const cashCents = toExactCents(price.cash);
  if (
    price.status !== "confirmed" ||
    cashCents === null ||
    price.installments === undefined ||
    price.installmentValue === undefined ||
    price.hasInterest === undefined
  ) {
    return false;
  }

  const installmentTotal = calculateInstallmentTotal(
    price.installments,
    price.installmentValue,
  );
  const installmentTotalCents = toExactCents(installmentTotal ?? undefined);
  if (installmentTotalCents === null) return false;

  return price.hasInterest
    ? installmentTotalCents > cashCents
    : installmentTotalCents === cashCents;
}

export function canPublishOffer(offer: CommercialOffer): boolean {
  return (
    offer.publicationStatus === "confirmed" &&
    offer.checkoutStatus === "confirmed" &&
    isValidCheckoutUrl(offer.checkoutUrl) &&
    offer.contentsStatus === "confirmed" &&
    Number.isInteger(offer.bottles) &&
    offer.bottles > 0 &&
    Number.isInteger(offer.approximateDurationMonths) &&
    offer.approximateDurationMonths > 0 &&
    Number.isInteger(offer.totalCapsules) &&
    offer.totalCapsules > 0 &&
    hasConfirmedPrice(offer.price) &&
    offer.image.status === "confirmed" &&
    typeof offer.image.src === "string" &&
    offer.image.src.length > 0 &&
    typeof offer.image.width === "number" &&
    offer.image.width > 0 &&
    typeof offer.image.height === "number" &&
    offer.image.height > 0 &&
    offer.image.resolutionApproved &&
    offer.image.rightsConfirmed
  );
}

export function canPublishCommercialSection(
  offers: readonly CommercialOffer[],
  dependencies: CommercialPublicationDependencies,
): boolean {
  return (
    offers.length > 0 &&
    offers.every(canPublishOffer) &&
    dependencies.refundPolicyStatus === "approved" &&
    dependencies.institutionalIdentificationStatus === "confirmed"
  );
}

const refundPolicy = legalDocuments.find((document) => document.id === "refunds");

export const commercialPublicationDependencies: CommercialPublicationDependencies =
  {
    refundPolicyStatus: refundPolicy?.status ?? "blocked",
    institutionalIdentificationStatus: "pending",
  };

export const offersReady = commercialOffers.every(canPublishOffer);

export const refundPolicyStatus =
  commercialPublicationDependencies.refundPolicyStatus;

export const commercialPublicationReady =
  offersReady &&
  refundPolicyStatus === "approved" &&
  commercialPublicationDependencies.institutionalIdentificationStatus ===
    "confirmed" &&
  regulatoryPublicationReady &&
  commercialSurfaceReady;
