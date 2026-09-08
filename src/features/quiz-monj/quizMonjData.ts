export type MonjDimension =
  | "leanProtection"
  | "skinAdaptation"
  | "celluliteContrast"
  | "clinicalSupport";

export type MonjImpact = Readonly<Partial<Record<MonjDimension, number>>>;

export interface MonjOption {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
  readonly impact: MonjImpact;
}

export interface MonjQuestion {
  readonly id: string;
  readonly block: string;
  readonly eyebrow: string;
  readonly prompt: string;
  readonly hint?: string;
  readonly presentation: "scenario" | "sentence" | "compact";
  readonly options: readonly MonjOption[];
}

const option = (
  id: string,
  label: string,
  impact: MonjImpact,
  detail?: string,
): MonjOption => ({ id, label, impact, ...(detail === undefined ? {} : { detail }) });

export const monjQuestions = [
  {
    id: "treatment-stage",
    block: "Seu momento",
    eyebrow: "Contexto do tratamento",
    prompt: "Como foi o seu caminho de emagrecimento até aqui?",
    hint: "Se usou tirzepatida, considere Mounjaro ou outra marca prescrita para você. Se emagreceu por outro caminho, escolha a última opção.",
    presentation: "scenario",
    options: [
      option("first-weeks", "Estou nas primeiras 4 semanas.", { clinicalSupport: 1, leanProtection: 1 }, "Meu corpo e meu apetite ainda estão se ajustando."),
      option("one-three", "Uso há 1 a 3 meses.", { leanProtection: 2, skinAdaptation: 1 }, "A perda de peso já começou a ficar visível."),
      option("over-three", "Uso há mais de 3 meses.", { skinAdaptation: 2, celluliteContrast: 1 }, "Já consigo comparar mudanças no corpo e na pele."),
      option("stopped", "Já usei e interrompi.", { clinicalSupport: 2, skinAdaptation: 1 }, "Quero entender o que percebi durante ou depois do uso."),
      option("other-strategy", "Emagreci por outra estratégia, sem tirzepatida.", {}, "Quero olhar para a pele e para a força depois dessa mudança."),
    ],
  },
  {
    id: "weight-change",
    block: "Seu momento",
    eyebrow: "Magnitude da mudança",
    prompt: "Quanto do seu peso inicial você estima ter perdido?",
    hint: "Uma aproximação basta. O percentual ajuda a diferenciar mudanças pequenas de transformações corporais maiores.",
    presentation: "compact",
    options: [
      option("not-sure", "Ainda não sei.", { clinicalSupport: 1 }),
      option("under-five", "Menos de 5%.", { leanProtection: 1 }),
      option("five-ten", "Entre 5% e 10%.", { leanProtection: 2, skinAdaptation: 1 }),
      option("over-ten", "Mais de 10%.", { leanProtection: 3, skinAdaptation: 3, celluliteContrast: 2 }),
    ],
  },
  {
    id: "loss-pace",
    block: "Seu momento",
    eyebrow: "Ritmo percebido",
    prompt: "Como essa perda aconteceu na sua percepção?",
    hint: "Não existe resposta “certa”: queremos entender se a pele, a alimentação e a força tiveram tempo de acompanhar.",
    presentation: "scenario",
    options: [
      option("gradual", "Gradualmente, sem grandes saltos.", { skinAdaptation: 1 }),
      option("fast", "Mais rápido do que eu esperava.", { skinAdaptation: 3, leanProtection: 2 }),
      option("very-fast", "Muito rápido, principalmente no início.", { skinAdaptation: 4, leanProtection: 3, clinicalSupport: 1 }),
      option("oscillating", "Em ondas: perco, estabilizo e volto a perder.", { clinicalSupport: 2, skinAdaptation: 2 }),
    ],
  },
  {
    id: "first-change",
    block: "Seu momento",
    eyebrow: "O que apareceu primeiro",
    prompt: "Qual mudança chamou sua atenção antes das outras?",
    presentation: "sentence",
    options: [
      option("loose-skin", "A pele pareceu mais solta ou “vazia”.", { skinAdaptation: 4 }),
      option("cellulite", "Os relevos da celulite ficaram mais aparentes.", { celluliteContrast: 4, skinAdaptation: 2 }),
      option("less-tone", "Percebi menos volume ou tônus muscular.", { leanProtection: 4 }),
      option("mixed", "Foi uma combinação dessas mudanças.", { leanProtection: 3, skinAdaptation: 3, celluliteContrast: 3 }),
    ],
  },
  {
    id: "body-area",
    block: "Pele e contorno",
    eyebrow: "Onde você percebe",
    prompt: "Em qual região essa mudança mais incomoda hoje?",
    presentation: "scenario",
    options: [
      option("thighs-glutes", "Coxas e glúteos.", { celluliteContrast: 4, skinAdaptation: 1 }),
      option("abdomen-arms", "Abdômen e braços.", { skinAdaptation: 4 }),
      option("face-neck", "Rosto e pescoço.", { skinAdaptation: 3, clinicalSupport: 1 }),
      option("several", "Em várias regiões ao mesmo tempo.", { skinAdaptation: 4, leanProtection: 2, celluliteContrast: 2 }),
    ],
  },
  {
    id: "strength-change",
    block: "Força e função",
    eyebrow: "Além do espelho",
    prompt: "Sua força ou disposição mudou junto com o peso?",
    hint: "Pense em escadas, sacolas, treino e tarefas comuns — não apenas na aparência.",
    presentation: "scenario",
    options: [
      option("stable", "Não. Minha força parece estável.", { leanProtection: 0 }),
      option("slight", "Sinto uma queda leve em alguns dias.", { leanProtection: 2 }),
      option("clear", "Sim. Treinos e tarefas ficaram claramente mais difíceis.", { leanProtection: 4, clinicalSupport: 2 }),
      option("limiting", "A fraqueza já limita atividades do dia a dia.", { leanProtection: 5, clinicalSupport: 5 }),
    ],
  },
  {
    id: "resistance-training",
    block: "Força e função",
    eyebrow: "Estímulo muscular",
    prompt: "Como o treino de força aparece na sua semana?",
    presentation: "compact",
    options: [
      option("three-plus", "3 vezes ou mais.", { leanProtection: 0 }),
      option("one-two", "1 a 2 vezes.", { leanProtection: 1 }),
      option("irregular", "Faço, mas sem regularidade.", { leanProtection: 3 }),
      option("none", "Não faço atualmente.", { leanProtection: 5 }),
    ],
  },
  {
    id: "protein-pattern",
    block: "Alimentação possível",
    eyebrow: "Com menos apetite",
    prompt: "Na maior parte dos dias, como ficam suas refeições com proteína?",
    hint: "Exemplos incluem ovos, leite e derivados, carnes, peixes, feijões, tofu e outras fontes orientadas para você.",
    presentation: "scenario",
    options: [
      option("distributed", "Consigo incluir em duas ou mais refeições.", { leanProtection: 0 }),
      option("one-meal", "Quase toda a proteína fica em uma refeição.", { leanProtection: 2 }),
      option("little-appetite", "Como pouco e frequentemente deixo a proteína de lado.", { leanProtection: 5, clinicalSupport: 2 }),
      option("not-sure", "Não sei avaliar minha ingestão.", { leanProtection: 3, clinicalSupport: 1 }),
    ],
  },
  {
    id: "intake-barrier",
    block: "Alimentação possível",
    eyebrow: "O que dificulta",
    prompt: "O que mais atrapalha você a comer e se hidratar bem?",
    presentation: "sentence",
    options: [
      option("no-barrier", "Nada importante no momento.", {}),
      option("low-appetite", "Pouca fome e saciedade muito rápida.", { leanProtection: 3 }),
      option("nausea", "Náusea, refluxo, constipação ou desconforto.", { clinicalSupport: 3, leanProtection: 2 }),
      option("vomiting", "Vômitos repetidos ou dificuldade para manter líquidos.", { clinicalSupport: 6, leanProtection: 3 }),
    ],
  },
  {
    id: "skin-history",
    block: "História da pele",
    eyebrow: "Antes deste emagrecimento",
    prompt: "Sua pele já passou por grandes mudanças de volume antes?",
    presentation: "sentence",
    options: [
      option("no", "Não que eu me lembre.", { skinAdaptation: 0 }),
      option("cycles", "Sim, por efeito sanfona.", { skinAdaptation: 4, celluliteContrast: 2 }),
      option("pregnancy", "Sim, por gestação ou pós-parto.", { skinAdaptation: 3, celluliteContrast: 1 }),
      option("both", "Sim, por mais de um desses motivos.", { skinAdaptation: 5, celluliteContrast: 2 }),
    ],
  },
  {
    id: "weight-stability",
    block: "História da pele",
    eyebrow: "Fase atual",
    prompt: "Seu peso está estabilizando ou ainda muda bastante?",
    presentation: "compact",
    options: [
      option("stable-three", "Estável há 3 meses ou mais.", { skinAdaptation: 0 }),
      option("recent-stable", "Estabilizou recentemente.", { skinAdaptation: 1 }),
      option("still-losing", "Ainda estou perdendo peso.", { skinAdaptation: 3, leanProtection: 2 }),
      option("up-down", "Oscila bastante.", { skinAdaptation: 3, clinicalSupport: 2 }),
    ],
  },
  {
    id: "recovery",
    block: "Base de recuperação",
    eyebrow: "Sono e energia",
    prompt: "Como você descreveria sua recuperação na última semana?",
    presentation: "scenario",
    options: [
      option("good", "Durmo bem e acordo recuperada.", {}),
      option("variable", "Alguns dias bons, outros cansativos.", { leanProtection: 1, clinicalSupport: 1 }),
      option("poor", "Sono ruim e cansaço frequente.", { leanProtection: 3, clinicalSupport: 2 }),
      option("exhausted", "Exaustão que interfere na minha rotina.", { leanProtection: 4, clinicalSupport: 4 }),
    ],
  },
  {
    id: "professional-support",
    block: "Acompanhamento",
    eyebrow: "Quem acompanha você",
    prompt: "Hoje, quem monitora seu tratamento e sua composição corporal?",
    hint: "Peso isolado conta apenas uma parte da história.",
    presentation: "scenario",
    options: [
      option("team", "Médico e nutricionista, com avaliação periódica.", { clinicalSupport: 0 }),
      option("doctor", "Apenas o médico que prescreveu.", { clinicalSupport: 1 }),
      option("occasional", "Tenho acompanhamento, mas é irregular.", { clinicalSupport: 3 }),
      option("none", "Não tenho acompanhamento no momento.", { clinicalSupport: 6 }),
    ],
  },
  {
    id: "main-goal",
    block: "Próximo passo",
    eyebrow: "O que você quer preservar",
    prompt: "Qual resultado faria mais diferença para você agora?",
    presentation: "sentence",
    options: [
      option("strength", "Continuar emagrecendo sem abrir mão da força.", { leanProtection: 3 }),
      option("firmness", "Dar melhores condições para a pele acompanhar.", { skinAdaptation: 3 }),
      option("cellulite", "Cuidar da aparência da celulite com expectativas reais.", { celluliteContrast: 3 }),
      option("integrated", "Organizar tudo isso em um plano possível.", { leanProtection: 2, skinAdaptation: 2, celluliteContrast: 2, clinicalSupport: 1 }),
    ],
  },
] as const satisfies readonly MonjQuestion[];

export const monjQuestionMap = Object.fromEntries(
  monjQuestions.map((question) => [question.id, question]),
) as Readonly<Record<string, MonjQuestion>>;

export const monjDimensions: readonly MonjDimension[] = [
  "leanProtection",
  "skinAdaptation",
  "celluliteContrast",
  "clinicalSupport",
];

export const monjDimensionLabels: Readonly<Record<MonjDimension, string>> = {
  leanProtection: "Proteção de força e massa magra",
  skinAdaptation: "Adaptação da pele ao novo volume",
  celluliteContrast: "Contraste visual da celulite",
  clinicalSupport: "Necessidade de acompanhamento",
};

export type MonjAnswers = Readonly<Record<string, string>>;

export function calculateMonjScores(answers: MonjAnswers): Readonly<Record<MonjDimension, number>> {
  const totals: Record<MonjDimension, number> = {
    leanProtection: 0,
    skinAdaptation: 0,
    celluliteContrast: 0,
    clinicalSupport: 0,
  };
  const maximums = { ...totals };

  for (const question of monjQuestions) {
    for (const dimension of monjDimensions) {
      maximums[dimension] += Math.max(0, ...question.options.map((item) => item.impact[dimension] ?? 0));
    }
    const selected = question.options.find((item) => item.id === answers[question.id]);
    if (selected === undefined) continue;
    for (const dimension of monjDimensions) totals[dimension] += selected.impact[dimension] ?? 0;
  }

  return Object.fromEntries(
    monjDimensions.map((dimension) => [dimension, Math.round((totals[dimension] / Math.max(1, maximums[dimension])) * 100)]),
  ) as Readonly<Record<MonjDimension, number>>;
}

export function selectedMonjLabel(answers: MonjAnswers, questionId: string): string {
  const question = monjQuestionMap[questionId];
  return question?.options.find((item) => item.id === answers[questionId])?.label ?? "Não informado";
}
