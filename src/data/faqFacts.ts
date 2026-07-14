import { usageFact } from "./productFacts";

export type FaqFactStatus = "confirmed" | "blocked";

export interface FaqAnswerLink {
  readonly label: string;
  readonly href: string;
}

export interface FaqFact {
  readonly id: string;
  readonly question: string;
  readonly answer?: string | undefined;
  readonly links?: readonly FaqAnswerLink[];
  readonly status: FaqFactStatus;
  readonly source: "label" | "document" | "both" | "editorial-rule";
}

const usageConfirmed = usageFact.status === "confirmed";
const totalCapsules = usageFact.totalCapsules;
const capsulesPerServing = usageFact.capsulesPerServing;
const capsulesPerDay = usageFact.capsulesPerDay;
const durationDays = usageFact.durationDays;

export const faqFacts: readonly FaqFact[] = [
  {
    id: "faq-o-que-e",
    question: "O que é o CeluClin?",
    answer:
      "CeluClin é um suplemento alimentar em cápsulas da Belvitale, apresentado como parte de uma rotina de autocuidado.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-medicamento",
    question: "CeluClin é medicamento?",
    answer: "Não. CeluClin é um suplemento alimentar e não é medicamento.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-conteudo",
    question: "Quantas cápsulas vêm no frasco?",
    answer:
      usageConfirmed && totalCapsules !== undefined
        ? `O frasco contém ${String(totalCapsules)} cápsulas.`
        : undefined,
    status:
      usageConfirmed && totalCapsules !== undefined ? "confirmed" : "blocked",
    source: "both",
  },
  {
    id: "faq-porcao",
    question: "Qual é a porção informada?",
    answer:
      usageConfirmed && capsulesPerServing !== undefined
        ? `A porção informada é de ${String(capsulesPerServing)} cápsulas.`
        : undefined,
    status:
      usageConfirmed && capsulesPerServing !== undefined
        ? "confirmed"
        : "blocked",
    source: "both",
  },
  {
    id: "faq-duracao",
    question: "Quanto tempo dura um frasco?",
    answer:
      usageConfirmed &&
      totalCapsules !== undefined &&
      capsulesPerDay !== undefined &&
      durationDays !== null &&
      durationDays !== undefined
        ? `Considerando o consumo informado de ${String(capsulesPerDay)} cápsulas ao dia, um frasco com ${String(totalCapsules)} cápsulas corresponde a ${String(durationDays)} dias de uso.`
        : undefined,
    status:
      usageConfirmed &&
      totalCapsules !== undefined &&
      capsulesPerDay !== undefined &&
      durationDays !== null &&
      durationDays !== undefined
        ? "confirmed"
        : "blocked",
    source: "both",
  },
  {
    id: "faq-publico",
    question: "Quem pode consumir?",
    answer:
      "O público mínimo informado na documentação disponível é de adultos a partir de 19 anos.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-composicao",
    question: "Onde vejo a composição?",
    answer:
      "A composição auditada e a arte original da embalagem estão disponíveis nesta página.",
    links: [
      { label: "Consultar composição", href: "#composicao" },
      { label: "Consultar rótulo original", href: "#rotulo" },
    ],
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-gluten-lactose",
    question: "Possui glúten ou lactose?",
    answer:
      "O rótulo informa que o produto não contém glúten e não contém lactose.",
    status: "confirmed",
    source: "label",
  },
  {
    id: "faq-resultados",
    question: "O produto garante resultados?",
    status: "blocked",
    source: "editorial-rule",
  },
  {
    id: "faq-armazenamento",
    question: "Como devo conservar?",
    status: "blocked",
    source: "document",
  },
  {
    id: "faq-curcuma",
    question: "A cúrcuma faz parte da fórmula?",
    status: "blocked",
    source: "document",
  },
];

export function getPublishedFaqFacts(
  facts: readonly FaqFact[],
): readonly (FaqFact & { readonly answer: string })[] {
  return facts.filter(
    (fact): fact is FaqFact & { readonly answer: string } =>
      fact.status === "confirmed" &&
      fact.answer !== undefined &&
      fact.answer.trim().length > 0,
  );
}

export const publishedFaqFacts = getPublishedFaqFacts(faqFacts);
