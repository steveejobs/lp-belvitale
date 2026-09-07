export type VerificationStatus = "pending" | "owner-authorized";

export type ProofCategoryId = "cellulite" | "laxity" | "localized-fat";

export interface GalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly category: ProofCategoryId;
  readonly aspectRatio: number;
  readonly fit: "contain" | "cover";
  readonly objectPosition?: string;
}

export interface ProofAsset extends GalleryImage {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly verificationStatus: VerificationStatus;
  readonly sourceFile: string;
  readonly sequenceLabel: string;
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

export const proofAuthorization = {
  status: "owner-authorized",
  declaredAt: "2026-07-14",
  scope:
    "Publicação e atribuição ao CeluClin das quatorze imagens recebidas, preservando arquivos, categorias e enquadramentos.",
  disclaimer:
    "Resultados reais autorizados. Experiências individuais podem variar. Identidade, data, duração e cronologia não foram fornecidas.",
  chronologyKnown: false,
} as const;

export const proofAssets: readonly ProofAsset[] = [
  {
    id: "cellulite-01",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-01.webp",
    width: 1254,
    height: 1254,
    aspectRatio: 1,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento de glúteos e coxas.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 5.png",
    sequenceLabel: "Registro 01 de 09",
  },
  {
    id: "cellulite-02",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-02.webp",
    width: 1448,
    height: 1086,
    aspectRatio: 1.3333,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento de glúteos e pernas.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 3.png",
    sequenceLabel: "Registro 02 de 09",
  },
  {
    id: "cellulite-03",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-03.webp",
    width: 1448,
    height: 1086,
    aspectRatio: 1.3333,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento posterior de quadril e coxas.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 1(1).png",
    sequenceLabel: "Registro 03 de 09",
  },
  {
    id: "cellulite-04",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-04.webp",
    width: 1448,
    height: 1086,
    aspectRatio: 1.3333,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com detalhe lateral de coxa.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 2.png",
    sequenceLabel: "Registro 04 de 09",
  },
  {
    id: "cellulite-05",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-05.jpg",
    width: 1024,
    height: 411,
    aspectRatio: 2.4915,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento frontal de quadril e coxas.",
    verificationStatus: "owner-authorized",
    sourceFile: "CS_EvolvePlusM8_2_Cellulite-scaled.jpg",
    sequenceLabel: "Registro 05 de 09",
  },
  {
    id: "cellulite-06",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-06.jpg",
    width: 1080,
    height: 1080,
    aspectRatio: 1,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em quatro partes com enquadramento lateral de quadril e coxas.",
    verificationStatus: "owner-authorized",
    sourceFile: "Flacidez-e-Celulite-Tratamento.jpg",
    sequenceLabel: "Registro 06 de 09",
  },
  {
    id: "cellulite-07",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-07.jpg",
    width: 998,
    height: 559,
    aspectRatio: 1.7853,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento lateral de quadril e coxa.",
    verificationStatus: "owner-authorized",
    sourceFile: "VelaShape-Cellulite-Reduction-Treatment-before-after-998x630.jpg",
    sequenceLabel: "Registro 07 de 09",
  },
  {
    id: "cellulite-08",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-08.jpg",
    width: 864,
    height: 666,
    aspectRatio: 1.2973,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento posterior de quadril e coxas.",
    verificationStatus: "owner-authorized",
    sourceFile: "WhatsApp Image 2026-08-27 at 10.53.33 (1).jpeg",
    sequenceLabel: "Registro 08 de 09",
  },
  {
    id: "cellulite-09",
    category: "cellulite",
    src: "/proof/cellulite/cellulite-09.jpg",
    width: 1278,
    height: 798,
    aspectRatio: 1.6015,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento posterior de quadril e pernas.",
    verificationStatus: "owner-authorized",
    sourceFile: "WhatsApp Image 2026-08-27 at 10.53.33.jpeg",
    sequenceLabel: "Registro 09 de 09",
  },
  {
    id: "laxity-01",
    category: "laxity",
    src: "/proof/laxity/laxity-01.webp",
    width: 1254,
    height: 1254,
    aspectRatio: 1,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento posterior do corpo.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 1 flacidez.png",
    sequenceLabel: "Registro 01 de 02",
  },
  {
    id: "laxity-02",
    category: "laxity",
    src: "/proof/laxity/laxity-02.webp",
    width: 1373,
    height: 1145,
    aspectRatio: 1.1991,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento de braço erguido.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova 2 flacidez.png",
    sequenceLabel: "Registro 02 de 02",
  },
  {
    id: "localized-fat-01",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-01.webp",
    width: 1537,
    height: 1023,
    aspectRatio: 1.5024,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento lateral do abdômen.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova gordura localizada  (1).png",
    sequenceLabel: "Registro 01 de 03",
  },
  {
    id: "localized-fat-02",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-02.webp",
    width: 1448,
    height: 1086,
    aspectRatio: 1.3333,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com enquadramento lateral de cintura e abdômen.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova gordura localizada  (2).png",
    sequenceLabel: "Registro 02 de 03",
  },
  {
    id: "localized-fat-03",
    category: "localized-fat",
    src: "/proof/localized-fat/localized-fat-03.webp",
    width: 1448,
    height: 1086,
    aspectRatio: 1.3333,
    fit: "contain",
    objectPosition: "center center",
    alt: "Montagem fotográfica em duas partes com detalhe lateral de cintura e abdômen.",
    verificationStatus: "owner-authorized",
    sourceFile: "prova gordura localizada  (3).png",
    sequenceLabel: "Registro 03 de 03",
  },
];
