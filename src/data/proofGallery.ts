export type VerificationStatus = "pending" | "verified";

export type ProofCategoryId = "cellulite" | "laxity" | "localized-fat";

export interface ProofAsset {
  readonly id: string;
  readonly category: ProofCategoryId;
  readonly src: string | null;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly verificationStatus: VerificationStatus;
}

export interface ProofCategory {
  readonly id: ProofCategoryId;
  readonly label: string;
}

export const proofCategories: readonly ProofCategory[] = [
  { id: "cellulite", label: "Celulite" },
  { id: "laxity", label: "Flacidez" },
  { id: "localized-fat", label: "Gordura localizada" },
];

export const proofAssets: readonly ProofAsset[] = [
  {
    id: "cellulite-01",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-01.webp",
    width: 1254,
    height: 1254,
    alt: "Montagem fotográfica em duas partes com enquadramento de glúteos e coxas.",
    verificationStatus: "pending",
  },
  {
    id: "cellulite-02",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-02.webp",
    width: 1448,
    height: 1086,
    alt: "Montagem fotográfica em duas partes com enquadramento de glúteos e pernas.",
    verificationStatus: "pending",
  },
  {
    id: "cellulite-03",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-03.webp",
    width: 1448,
    height: 1086,
    alt: "Montagem fotográfica em duas partes com enquadramento posterior de quadril e coxas.",
    verificationStatus: "pending",
  },
  {
    id: "cellulite-04",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-04.webp",
    width: 1448,
    height: 1086,
    alt: "Montagem fotográfica em duas partes com detalhe lateral de coxa.",
    verificationStatus: "pending",
  },
  {
    id: "laxity-01",
    category: "laxity",
    src: "/proof/laxity/laxity-01.webp",
    width: 1254,
    height: 1254,
    alt: "Montagem fotográfica em duas partes com enquadramento posterior do corpo.",
    verificationStatus: "pending",
  },
  {
    id: "laxity-02",
    category: "laxity",
    src: "/proof/laxity/laxity-02.webp",
    width: 1373,
    height: 1145,
    alt: "Montagem fotográfica em duas partes com enquadramento de braço erguido.",
    verificationStatus: "pending",
  },
  {
    id: "localized-fat-01",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-01.webp",
    width: 1537,
    height: 1023,
    alt: "Montagem fotográfica em duas partes com enquadramento lateral do abdômen.",
    verificationStatus: "pending",
  },
  {
    id: "localized-fat-02",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-02.webp",
    width: 1448,
    height: 1086,
    alt: "Montagem fotográfica em duas partes com enquadramento lateral de cintura e abdômen.",
    verificationStatus: "pending",
  },
  {
    id: "localized-fat-03",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-03.webp",
    width: 1448,
    height: 1086,
    alt: "Montagem fotográfica em duas partes com detalhe lateral de cintura e abdômen.",
    verificationStatus: "pending",
  },
];

