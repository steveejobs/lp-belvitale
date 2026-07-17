import type {
  CommercialSignals,
  QuizQuestion,
  QuizQuestionId,
} from "../domain/quiz.types";

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "appearance-moment",
    eyebrow: "Cena 1 · vida real",
    prompt: "Qual dessas cenas chegou mais perto de você ultimamente?",
    context:
      "Não existe resposta certa. A ideia é reconhecer uma escolha cotidiana, sem avaliar o seu corpo.",
    presentation: "scenario",
    commercial: false,
    options: [
      {
        id: "clothes-waited",
        label: "Uma roupa ficou no armário",
        detail: "Eu queria usá-la, mas acabei escolhendo outra.",
        impact: { dailyImpact: 3, startStyle: 1 },
      },
      {
        id: "photo-almost-missed",
        label: "Uma foto quase não aconteceu",
        detail: "Hesitei por um instante antes de entrar no enquadramento.",
        impact: { dailyImpact: 3, proofPreference: 1 },
      },
      {
        id: "noticed-and-lived",
        label: "Eu notei e segui o meu dia",
        detail: "A percepção apareceu, mas não comandou a escolha.",
        impact: { dailyImpact: 0, recoveryCapacity: 3, startStyle: 1 },
      },
      {
        id: "changes-with-the-day",
        label: "Isso muda conforme o dia",
        detail: "Em alguns momentos pesa mais; em outros, quase nada.",
        impact: { dailyImpact: 2, routineFriction: 1 },
      },
    ],
  },
  {
    id: "way-of-starting",
    eyebrow: "Cena 2 · o primeiro passo",
    prompt: "Quando você decide cuidar de algo por você, como costuma começar?",
    context: "Pense no que realmente acontece — não no começo perfeito.",
    presentation: "cards",
    commercial: false,
    options: [
      {
        id: "small-visible-cue",
        label: "Crio um lembrete pequeno e visível",
        detail: "Um lugar, um horário ou um gesto que puxa o próximo passo.",
        impact: { startStyle: 3, recoveryCapacity: 2 },
      },
      {
        id: "understand-first",
        label: "Entendo bem antes de começar",
        detail: "Informação clara me ajuda a dar o primeiro passo com segurança.",
        impact: { startStyle: 1, proofPreference: 3 },
      },
      {
        id: "motivation-sprint",
        label: "Aproveito o embalo da motivação",
        detail: "Começo com energia e organizo o restante enquanto avanço.",
        impact: { startStyle: -2, routineFriction: 2 },
      },
      {
        id: "fit-as-i-go",
        label: "Vou encaixando sem uma estrutura fixa",
        detail: "Prefiro ajustar ao ritmo dos dias em vez de criar um plano rígido.",
        impact: { startStyle: 0, recoveryCapacity: 2, routineFriction: 1 },
      },
    ],
  },
  {
    id: "routine-friction",
    eyebrow: "Cena 3 · o que atravessa",
    prompt: "O que mais costuma interromper uma rotina que começou bem?",
    context: "Interrupção não é falha de caráter. Normalmente, há uma fricção concreta por trás.",
    presentation: "scenario",
    commercial: false,
    options: [
      {
        id: "full-days",
        label: "Dias cheios mudam a prioridade",
        detail: "Quando tudo aperta, o cuidado sai do campo de visão.",
        impact: { routineFriction: 3, recoveryCapacity: 1 },
      },
      {
        id: "out-of-sight",
        label: "O cuidado fica invisível",
        detail: "Sem uma pista no ambiente, eu simplesmente esqueço.",
        impact: { routineFriction: 2, startStyle: 3 },
      },
      {
        id: "too-many-steps",
        label: "Muitos passos tornam tudo pesado",
        detail: "Quando depende de preparação demais, a chance de adiar aumenta.",
        impact: { routineFriction: 3, startStyle: -1 },
      },
      {
        id: "unclear-information",
        label: "A dúvida reaparece no meio do caminho",
        detail: "Se a informação não está clara, perco confiança na escolha.",
        impact: { routineFriction: 1, proofPreference: 3 },
      },
    ],
  },
  {
    id: "after-a-missed-day",
    eyebrow: "Cena 4 · depois da pausa",
    prompt: "Depois de um dia perdido, o que costuma acontecer?",
    context: "A capacidade de retomar diz mais sobre constância do que uma sequência perfeita.",
    presentation: "scale",
    commercial: false,
    options: [
      {
        id: "next-opportunity",
        label: "Volto na próxima oportunidade",
        detail: "Um dia não precisa virar uma semana.",
        impact: { recoveryCapacity: 3, startStyle: 1 },
      },
      {
        id: "reset-with-cue",
        label: "Retomo com um lembrete simples",
        detail: "Preciso de uma pista concreta para reencontrar o fio.",
        impact: { recoveryCapacity: 2, startStyle: 3 },
      },
      {
        id: "wait-for-motivation",
        label: "Espero a motivação voltar",
        detail: "A pausa pode durar mais do que eu gostaria.",
        impact: { recoveryCapacity: -2, startStyle: -2 },
      },
      {
        id: "recheck-the-choice",
        label: "Reavalio se ainda faz sentido",
        detail: "Retomo melhor quando a escolha continua clara para mim.",
        impact: { recoveryCapacity: 0, proofPreference: 3, startStyle: 1 },
      },
    ],
  },
  {
    id: "trust-language",
    eyebrow: "Cena 5 · confiança",
    prompt: "Que tipo de informação mais reduz a sua dúvida?",
    context: "Aqui, prova não significa promessa: significa saber o que existe e qual é o limite da informação.",
    presentation: "cards",
    commercial: false,
    options: [
      {
        id: "label-and-facts",
        label: "Rótulo e informações objetivas",
        detail: "Quero conferir composição, modo de uso e avisos sem rodeios.",
        impact: { proofPreference: 3, startStyle: 2 },
      },
      {
        id: "full-size-authorized-images",
        label: "Imagens autorizadas em tamanho real",
        detail: "Com contexto e limites claros, sem prometer causalidade.",
        impact: { proofPreference: 2, dailyImpact: 2 },
      },
      {
        id: "options-side-by-side",
        label: "Uma comparação lado a lado",
        detail: "Critérios visíveis me ajudam a entender as diferenças.",
        impact: { proofPreference: 2, startStyle: 3 },
      },
      {
        id: "time-without-pressure",
        label: "Tempo para entender sem pressão",
        detail: "Confio mais quando posso revisar antes de decidir.",
        impact: { proofPreference: 1, recoveryCapacity: 3 },
      },
    ],
  },
  {
    id: "planning-horizon",
    eyebrow: "Cena 6 · continuidade",
    prompt: "Quando uma rotina faz sentido, como você prefere planejar a continuidade?",
    context:
      "Agora entramos na parte comercial. Esta resposta pode influenciar a opção de CeluClin mostrada no final.",
    presentation: "scale",
    commercial: true,
    options: [
      {
        id: "one-step-first",
        label: "Dou um passo e decido depois",
        detail: "Prefiro conhecer primeiro, sem organizar um horizonte maior agora.",
        impact: {
          planningHorizon: -2,
          replacementTolerance: -1,
          commitmentComfort: -2,
          purchaseReadiness: 1,
          continuityPreference: -2,
        },
      },
      {
        id: "next-few-months",
        label: "Organizo os próximos meses",
        detail: "Gosto de continuidade moderada e de reduzir decisões de reposição.",
        impact: {
          planningHorizon: 1,
          replacementTolerance: 2,
          commitmentComfort: 1,
          purchaseReadiness: 2,
          continuityPreference: 2,
        },
      },
      {
        id: "longer-stock",
        label: "Prefiro um estoque mais prolongado",
        detail: "Menos reposições e um compromisso de longo prazo me parecem confortáveis.",
        impact: {
          planningHorizon: 3,
          replacementTolerance: 3,
          commitmentComfort: 3,
          purchaseReadiness: 3,
          continuityPreference: 3,
        },
      },
      {
        id: "flexible-continuity",
        label: "Quero continuidade, sem planejar tão longe",
        detail: "Um meio-termo flexível combina melhor com o meu momento.",
        impact: {
          planningHorizon: 0,
          replacementTolerance: 1,
          commitmentComfort: 0,
          purchaseReadiness: 1,
          continuityPreference: 1,
        },
      },
    ],
  },
  {
    id: "honest-commitment",
    eyebrow: "Cena 7 · uma escolha honesta",
    prompt: "Se o CeluClin fizer sentido depois das informações, qual compromisso parece realista agora?",
    context:
      "Você não está escolhendo um kit ainda. Esta é a declaração principal usada para recomendar uma opção.",
    presentation: "scenario",
    commercial: true,
    options: [
      {
        id: "try-before-continuity",
        label: "Quero conhecer antes de organizar continuidade",
        detail: "Um compromisso inicial baixo é o mais honesto para mim.",
        impact: {
          commitmentComfort: -2,
          continuityPreference: -2,
          planningHorizon: -1,
          replacementTolerance: -1,
          purchaseReadiness: 2,
        },
      },
      {
        id: "moderate-commitment",
        label: "Alguns meses organizados fazem sentido",
        detail: "Quero continuidade moderada e menos decisões de reposição.",
        impact: {
          commitmentComfort: 2,
          continuityPreference: 2,
          planningHorizon: 2,
          replacementTolerance: 2,
          purchaseReadiness: 3,
        },
      },
      {
        id: "explicit-long-commitment",
        label: "Um estoque prolongado combina com meu planejamento",
        detail: "Menos reposições e compromisso de longo prazo são preferências explícitas.",
        impact: {
          commitmentComfort: 3,
          continuityPreference: 3,
          planningHorizon: 3,
          replacementTolerance: 3,
          purchaseReadiness: 3,
        },
      },
      {
        id: "not-ready-to-buy",
        label: "Ainda estou entendendo; não quero decidir compra",
        detail: "Quero ver o resultado e as opções sem assumir compromisso agora.",
        impact: {
          commitmentComfort: -3,
          continuityPreference: -2,
          planningHorizon: -2,
          replacementTolerance: 0,
          purchaseReadiness: -3,
        },
      },
    ],
  },
] as const;

export const quizQuestionMap = Object.fromEntries(
  quizQuestions.map((question) => [question.id, question]),
) as Readonly<Record<QuizQuestionId, QuizQuestion>>;

export const commercialSignalMap: Readonly<
  Record<string, Partial<CommercialSignals>>
> = {
  "one-step-first": {
    planningPreference: "short",
    replacementPreference: "as-needed",
    continuityPreference: "first-step",
  },
  "next-few-months": {
    planningPreference: "medium",
    replacementPreference: "fewer",
    continuityPreference: "steady",
  },
  "longer-stock": {
    planningPreference: "long",
    replacementPreference: "fewest",
    continuityPreference: "extended",
  },
  "flexible-continuity": {
    planningPreference: "flexible",
    replacementPreference: "neutral",
    continuityPreference: "open",
  },
  "try-before-continuity": {
    declaredCommitment: "explore",
    purchaseReadiness: "trial-ready",
  },
  "moderate-commitment": {
    declaredCommitment: "moderate",
    purchaseReadiness: "ready",
  },
  "explicit-long-commitment": {
    declaredCommitment: "long",
    purchaseReadiness: "long-ready",
  },
  "not-ready-to-buy": {
    declaredCommitment: "undecided",
    purchaseReadiness: "not-ready",
  },
};

export function getQuizQuestion(id: string): QuizQuestion | null {
  return quizQuestions.find((question) => question.id === id) ?? null;
}
