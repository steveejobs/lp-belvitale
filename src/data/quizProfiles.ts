export type QuizProfile =
  | "simple-start"
  | "gradual-consistency"
  | "conscious-continuity";

export interface QuizResultProfile {
  readonly id: QuizProfile;
  readonly eyebrow: "Seu ritmo";
  readonly title: string;
  readonly description: string;
  readonly characteristics: readonly string[];
  readonly ritualTitle: string;
  readonly ritual: string;
  readonly nextStep: string;
}

export const quizProfileOrder: readonly QuizProfile[] = [
  "simple-start",
  "gradual-consistency",
  "conscious-continuity",
] as const;

export const quizProfiles: Readonly<Record<QuizProfile, QuizResultProfile>> = {
  "simple-start": {
    id: "simple-start",
    eyebrow: "Seu ritmo",
    title: "Começo sem peso",
    description:
      "Você encontra espaço para o cuidado quando o primeiro passo é leve o bastante para não disputar energia com o resto do dia.",
    characteristics: [
      "Prefere entender o essencial primeiro.",
      "Começa melhor com pouca fricção.",
      "Ajusta a rotina enquanto vive, não antes.",
    ],
    ritualTitle: "Um ritual possível",
    ritual:
      "Escolha um único ponto do dia que já acontece. Deixe a próxima ação visível ali e avalie, depois de uma semana, se esse lugar foi natural.",
    nextStep:
      "Conheça a composição, o modo de uso e o rótulo do CeluClin antes de decidir se ele cabe no seu começo.",
  },
  "gradual-consistency": {
    id: "gradual-consistency",
    eyebrow: "Seu ritmo",
    title: "Ritmo que volta",
    description:
      "Para você, constância não é uma sequência perfeita. É saber retomar sem fazer de um dia fora do plano uma desistência.",
    characteristics: [
      "Responde bem a referências simples.",
      "Constrói ritmo por repetição, não cobrança.",
      "Precisa que a retomada seja fácil.",
    ],
    ritualTitle: "Um ritual possível",
    ritual:
      "Defina uma âncora e uma regra de retorno: se um dia escapar, o próximo gesto é apenas voltar ao uso informado, sem compensação.",
    nextStep:
      "Veja o que compõe o CeluClin e como o uso informado pode conversar com uma rotina que sempre deixa espaço para voltar.",
  },
  "conscious-continuity": {
    id: "conscious-continuity",
    eyebrow: "Seu ritmo",
    title: "Cuidado em curso",
    description:
      "Você protege melhor o autocuidado quando enxerga a continuidade e deixa as próximas decisões encaminhadas.",
    characteristics: [
      "Gosta de visualizar o que vem depois.",
      "Integra novos gestos a hábitos existentes.",
      "Organização reduz interrupções desnecessárias.",
    ],
    ritualTitle: "Um ritual possível",
    ritual:
      "Ligue o gesto a um hábito já estável e escolha um lembrete de reposição. Planejar aqui significa abrir espaço, não exigir perfeição.",
    nextStep:
      "Consulte composição, uso e rótulo do CeluClin. Uma escolha organizada continua sendo uma escolha informada.",
  },
};

export function isQuizProfile(value: unknown): value is QuizProfile {
  return quizProfileOrder.some((profile) => profile === value);
}
