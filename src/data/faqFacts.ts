import {
  getTelephoneHref,
  institutionalFacts,
  isConfirmedInstitutionalFact,
} from "./institutionalFacts";
import { usageFact } from "./productFacts";

export type FaqFactStatus = "confirmed" | "blocked";

export interface FaqAnswerLink {
  readonly label: string;
  readonly href: string;
}

export interface FaqFact {
  readonly id: string;
  readonly question: string;
  readonly answer?: string;
  readonly links?: readonly FaqAnswerLink[];
  readonly status: FaqFactStatus;
  readonly source: "label" | "document" | "both" | "editorial-rule";
}

const usageConfirmed =
  usageFact.status === "confirmed" &&
  usageFact.totalCapsules !== undefined &&
  usageFact.capsulesPerDay !== undefined &&
  usageFact.durationDays !== null &&
  usageFact.durationDays !== undefined;
const phoneHref = getTelephoneHref(institutionalFacts.phone);
const phoneValue = isConfirmedInstitutionalFact(institutionalFacts.phone)
  ? institutionalFacts.phone.value
  : null;

export const faqFacts: readonly FaqFact[] = [
  {
    id: "faq-o-que-e",
    question: "O que é o CeluClin?",
    answer:
      "CeluClin é um suplemento alimentar em cápsulas da Belvitale. Não é medicamento.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-como-usar",
    question: "Como é o uso informado?",
    ...(usageConfirmed
      ? {
          answer: `O rótulo informa o consumo de ${String(usageFact.capsulesPerDay)} cápsulas ao dia. O frasco contém ${String(usageFact.totalCapsules)} cápsulas.`,
        }
      : {}),
    status: usageConfirmed ? "confirmed" : "blocked",
    source: "both",
  },
  {
    id: "faq-duracao",
    question: "Quanto tempo dura um frasco?",
    ...(usageConfirmed
      ? {
          answer: `${String(usageFact.totalCapsules)} cápsulas divididas pelo uso informado de ${String(usageFact.capsulesPerDay)} ao dia correspondem a aproximadamente ${String(usageFact.durationDays)} dias.`,
        }
      : {}),
    status: usageConfirmed ? "confirmed" : "blocked",
    source: "both",
  },
  {
    id: "faq-publico",
    question: "Para quem o produto é indicado?",
    answer:
      "O público mínimo informado é de adultos a partir de 19 anos. O rótulo informa que gestantes, lactantes e crianças não devem consumir.",
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-composicao",
    question: "Onde vejo a composição completa?",
    answer:
      "A composição por porção está nesta página, e a arte original da embalagem pode ser ampliada na seção de rótulo.",
    links: [
      { label: "Ver composição", href: "#composicao" },
      { label: "Abrir rótulo", href: "#rotulo" },
    ],
    status: "confirmed",
    source: "both",
  },
  {
    id: "faq-gluten-lactose",
    question: "Contém glúten ou lactose?",
    answer:
      "O rótulo informa que o produto não contém glúten e não contém lactose.",
    status: "confirmed",
    source: "label",
  },
  {
    id: "faq-resultados",
    question: "Como o CeluClin entra na minha rotina de cuidado?",
    answer:
      "CeluClin reúne vitamina C, zinco e outros ingredientes para complementar a alimentação. A vitamina C auxilia na formação do colágeno e o zinco auxilia na proteção dos danos causados pelos radicais livres. Consulte a composição e siga o uso informado no rótulo, considerando suas necessidades individuais.",
    links: [{ label: "Entender o papel do produto", href: "#resultados" }],
    status: "confirmed",
    source: "editorial-rule",
  },
  {
    id: "faq-compra-suporte",
    question: "Como escolho um kit e falo com o suporte?",
    answer:
      phoneValue === null
        ? "Compare os kits na seção de opções e conclua a escolha no checkout da Belvitale."
        : `Compare os kits na seção de opções e conclua a escolha no checkout da Belvitale. O SAC informado é ${phoneValue}.`,
    links: [
      { label: "Ver opções", href: "#ofertas" },
      ...(phoneHref === null
        ? []
        : [{ label: "Ligar para o SAC", href: phoneHref }]),
    ],
    status: "confirmed",
    source: "editorial-rule",
  },
] as const;

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
