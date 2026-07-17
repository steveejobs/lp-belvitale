import type { QuizDimension } from "./quizQuestions";

export type QuizProfile =
  | "fits-now"
  | "return-counts"
  | "marked-place"
  | "everything-at-hand";

export type QuizConfidence = "clear" | "blended" | "subtle";

export interface QuizResultProfile {
  readonly id: QuizProfile;
  readonly title: string;
  readonly recognition: string;
  readonly description: string;
  readonly characteristics: readonly [string, string, string];
  readonly attentionTitle: string;
  readonly attention: string;
  readonly orientation: string;
  readonly ritualTitle: string;
  readonly ritual: string;
  readonly center: Readonly<Record<QuizDimension, number>>;
}

export const quizProfileOrder = [
  "fits-now",
  "return-counts",
  "marked-place",
  "everything-at-hand",
] as const satisfies readonly QuizProfile[];

export const quizConfidenceCopy: Readonly<Record<QuizConfidence, string>> = {
  clear: "Seu padrão apareceu com bastante clareza.",
  blended: "Seu ritmo combina pistas diferentes, com uma direção que se repete.",
  subtle: "Esta é uma tendência do seu momento, não uma caixa fechada.",
};

export const quizProfiles: Readonly<Record<QuizProfile, QuizResultProfile>> = {
  "fits-now": {
    id: "fits-now",
    title: "Cabe no agora",
    recognition:
      "Você começa melhor quando o cuidado pede pouco espaço e deixa a continuidade ser decidida na prática.",
    description:
      "Seu ritmo valoriza um primeiro gesto claro, autonomia para observar como ele cabe e liberdade para ajustar sem transformar começo em compromisso pesado.",
    characteristics: [
      "Você reduz a distância entre decidir e experimentar.",
      "Poucas instruções ajudam mais do que uma estrutura grande.",
      "A continuidade fica mais honesta quando pode ser escolhida depois.",
    ],
    attentionTitle: "O pequeno não pode ficar invisível",
    attention:
      "Quando tudo fica aberto demais, o gesto pode desaparecer no meio do dia. Leveza ainda precisa de uma pista concreta.",
    orientation:
      "Escolha um lugar visível e avalie só uma coisa na primeira semana: foi fácil lembrar?",
    ritualTitle: "Um gesto, um lugar, sete dias",
    ritual:
      "Deixe o que você precisa junto de algo que já usa. Por sete dias, apenas volte a esse ponto — sem aumentar a meta e sem compensar pausas.",
    center: {
      startEase: 86,
      recovery: 64,
      simplicity: 88,
      consistency: 45,
      planning: 22,
      replenishmentRelief: 22,
      autonomy: 78,
      commitmentComfort: 18,
    },
  },
  "return-counts": {
    id: "return-counts",
    title: "Voltar também conta",
    recognition:
      "Seu ritmo não depende de uma sequência perfeita. Ele ganha força quando a volta continua simples.",
    description:
      "Você parece sustentar melhor uma rotina com margem para semanas diferentes, horários móveis e retomadas que não carregam culpa nem compensação.",
    characteristics: [
      "Você reconhece adaptação como parte da constância.",
      "Uma pausa não precisa apagar o que já foi construído.",
      "Liberdade de ajuste ajuda o cuidado a continuar presente.",
    ],
    attentionTitle: "Flexibilidade precisa de um ponto de retorno",
    attention:
      "Mudar o horário ajuda; precisar decidir tudo de novo, todos os dias, pode cansar.",
    orientation:
      "Defina uma regra curta de retorno: se um dia escapar, o próximo gesto é só recomeçar no primeiro horário possível.",
    ritualTitle: "A regra do próximo gesto",
    ritual:
      "Escolha uma âncora principal e uma alternativa. Se a primeira não acontecer, use a segunda sem dobrar, compensar ou revisar a semana inteira.",
    center: {
      startEase: 65,
      recovery: 92,
      simplicity: 72,
      consistency: 66,
      planning: 42,
      replenishmentRelief: 42,
      autonomy: 78,
      commitmentComfort: 45,
    },
  },
  "marked-place": {
    id: "marked-place",
    title: "Lugar certo, hora certa",
    recognition:
      "Você mantém melhor o que encontra um lugar reconhecível dentro de um dia que já existe.",
    description:
      "Seu ritmo responde a âncoras concretas: um horário aproximado, um objeto à vista e um caminho que não precisa ser reconstruído a cada manhã.",
    characteristics: [
      "Repetição funciona quando o contexto ajuda a lembrar.",
      "Um pouco de planejamento abre espaço em vez de apertar.",
      "Você tende a proteger o que já ganhou lugar na rotina.",
    ],
    attentionTitle: "A agenda muda — a âncora pode mudar junto",
    attention:
      "Um horário rígido demais transforma organização em obstáculo quando a semana sai do desenho.",
    orientation:
      "Ligue o gesto a um hábito estável e escolha, desde já, uma segunda âncora para dias fora do padrão.",
    ritualTitle: "Âncora principal, âncora reserva",
    ritual:
      "Associe o cuidado a dois momentos que já acontecem. Use o primeiro como referência e o segundo apenas quando a vida real pedir.",
    center: {
      startEase: 62,
      recovery: 64,
      simplicity: 54,
      consistency: 92,
      planning: 72,
      replenishmentRelief: 58,
      autonomy: 60,
      commitmentComfort: 66,
    },
  },
  "everything-at-hand": {
    id: "everything-at-hand",
    title: "Tudo à mão",
    recognition:
      "Você protege melhor uma rotina quando as próximas decisões já estão encaminhadas.",
    description:
      "Seu ritmo encontra leveza na preparação: informação acessível, reposições menos frequentes e uma escolha capaz de permanecer sem ocupar espaço mental todos os dias.",
    characteristics: [
      "Antecipar reduz interrupções que você prefere evitar.",
      "Visão dos próximos passos traz tranquilidade para decidir.",
      "Conveniência, para você, é precisar reabrir menos escolhas.",
    ],
    attentionTitle: "Planejar não precisa fechar todas as saídas",
    attention:
      "Uma estrutura útil continua permitindo mudar de ideia quando a rotina ou a preferência mudar.",
    orientation:
      "Organize o necessário para um período realista e marque uma revisão simples, sem transformar planejamento em obrigação.",
    ritualTitle: "Decidir uma vez, revisar com calma",
    ritual:
      "Deixe o cuidado abastecido e marque no calendário apenas o momento de revisar a escolha. Até lá, a rotina pode seguir sem novas decisões.",
    center: {
      startEase: 48,
      recovery: 55,
      simplicity: 44,
      consistency: 76,
      planning: 92,
      replenishmentRelief: 94,
      autonomy: 74,
      commitmentComfort: 88,
    },
  },
};

export function isQuizProfile(value: unknown): value is QuizProfile {
  return quizProfileOrder.some((profile) => profile === value);
}

export function isQuizConfidence(value: unknown): value is QuizConfidence {
  return value === "clear" || value === "blended" || value === "subtle";
}
