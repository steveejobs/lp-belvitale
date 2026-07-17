import type { QuizQuestion, QuizQuestionId } from "../domain/quiz.types";

export const quizQuestions = [
  {
    id: "trigger",
    eyebrow: "A cena que acende o alerta",
    prompt: "Qual momento mais costuma fazer você pensar que está na hora de voltar a se cuidar?",
    hint: "Escolha a cena que acontece de verdade — não a resposta que parece mais bonita.",
    presentation: "scenario",
    autoAdvance: true,
    options: [
      {
        id: "clothes-fit",
        label: "Quando uma roupa não veste como eu gostaria.",
        detail: "A peça vira um lembrete imediato.",
        narrative: { actionBias: 2, clarityNeed: 1 },
      },
      {
        id: "unexpected-photo",
        label: "Quando vejo uma foto sem estar preparada.",
        detail: "A imagem chama atenção antes de qualquer plano.",
        narrative: { proofNeed: 2, clarityNeed: 1 },
      },
      {
        id: "skin-texture",
        label: "Quando reparo na textura da pele.",
        detail: "O olhar se concentra em um detalhe específico.",
        narrative: { clarityNeed: 2, proofNeed: 1 },
      },
      {
        id: "self-last",
        label: "Quando percebo que venho me deixando para depois.",
        detail: "O incômodo aparece junto da vontade de retomar.",
        narrative: { recoveryCapacity: 2, structurePreference: 1 },
      },
    ],
  },
  {
    id: "concern",
    eyebrow: "O que seu olhar encontra primeiro",
    prompt: "Hoje, o que mais chama sua atenção?",
    hint: "Isso personaliza linguagem e prova visual. Não define duração nem quantidade.",
    presentation: "media",
    autoAdvance: true,
    options: [
      { id: "cellulite", label: "Aparência da celulite.", shortLabel: "Celulite", concern: "cellulite", narrative: { proofNeed: 1 } },
      { id: "firmness", label: "Aparência de menor firmeza.", shortLabel: "Firmeza", concern: "firmness", narrative: { clarityNeed: 1 } },
      { id: "contour", label: "Contorno de algumas regiões.", shortLabel: "Contorno", concern: "contour", narrative: { clarityNeed: 1 } },
      { id: "balanced", label: "Um pouco de cada coisa.", shortLabel: "Combinação", concern: "balanced", narrative: { proofNeed: 1, clarityNeed: 1 } },
    ],
  },
  {
    id: "impact",
    eyebrow: "O efeito nas suas escolhas",
    prompt: "Quando isso incomoda, o que muda primeiro?",
    hint: "Não estamos medindo intensidade. Só queremos entender onde o incômodo aparece.",
    presentation: "binary",
    autoAdvance: true,
    options: [
      { id: "clothes-choice", label: "Mudo a roupa que eu escolheria.", detail: "A decisão acontece antes de sair.", narrative: { actionBias: 2, clarityNeed: 1 } },
      { id: "photo-angle", label: "Penso mais no ângulo ou evito a foto.", detail: "A imagem passa a ocupar espaço demais.", narrative: { proofNeed: 2, clarityNeed: 1 } },
      { id: "care-restart", label: "Sinto vontade de retomar algum cuidado.", detail: "O incômodo vira movimento.", narrative: { actionBias: 2, recoveryCapacity: 2 } },
      { id: "passes", label: "Percebo, mas sigo sem mudar o dia.", detail: "A atenção existe sem comandar a escolha.", narrative: { recoveryCapacity: 1, structurePreference: -1 } },
    ],
  },
  {
    id: "attempts",
    eyebrow: "O que já aconteceu antes",
    prompt: "Qual frase descreve melhor sua história com novas rotinas de cuidado?",
    hint: "Aqui aparece a fricção — não falta de força de vontade.",
    presentation: "sentence",
    autoAdvance: true,
    options: [
      { id: "routine-tightened", label: "Comecei animada e parei quando a rotina apertou.", narrative: { recoveryCapacity: 2, structurePreference: 1 } },
      { id: "research-delayed", label: "Pesquisei tanto que adiei a decisão.", narrative: { clarityNeed: 2, proofNeed: 2, actionBias: -1 } },
      { id: "no-continuity", label: "Comprei algo, mas não organizei continuidade.", narrative: { structurePreference: 2, recoveryCapacity: 1 } },
      { id: "needs-security", label: "Ainda não encontrei algo que me passe segurança.", narrative: { proofNeed: 2, clarityNeed: 2 } },
    ],
  },
  {
    id: "recovery",
    eyebrow: "O dia seguinte conta mais",
    prompt: "Quando uma rotina falha por alguns dias, o que mais parece com você?",
    hint: "Deslize a régua ou toque na frase mais próxima.",
    presentation: "scale",
    autoAdvance: false,
    options: [
      { id: "restart-small", label: "Retomo com um gesto menor, sem compensar.", shortLabel: "Retomo logo", narrative: { recoveryCapacity: 3, actionBias: 2 } },
      { id: "need-cue", label: "Volto quando encontro um lembrete claro.", shortLabel: "Preciso de uma pista", narrative: { structurePreference: 2, recoveryCapacity: 1 } },
      { id: "replan", label: "Reorganizo o caminho antes de tentar de novo.", shortLabel: "Reorganizo", narrative: { structurePreference: 3, clarityNeed: 1 } },
      { id: "postpone", label: "Costumo adiar até sentir um novo impulso.", shortLabel: "Adio a volta", narrative: { recoveryCapacity: -2, actionBias: -1, proofNeed: 1 } },
    ],
  },
  {
    id: "proof-preference",
    eyebrow: "Sua confiança tem uma linguagem",
    prompt: "O que mais ajuda você a confiar antes de escolher?",
    hint: "A próxima tela será organizada pela sua resposta.",
    presentation: "comparison",
    autoAdvance: true,
    options: [
      { id: "authorized-experiences", label: "Ver experiências autorizadas.", detail: "Imagem primeiro; contexto sempre perto.", narrative: { proofNeed: 3 } },
      { id: "composition-use", label: "Entender composição e uso.", detail: "Informação objetiva antes da promessa.", narrative: { clarityNeed: 3, proofNeed: 1 } },
      { id: "compare-options", label: "Comparar opções claramente.", detail: "Diferenças visíveis, sem letras miúdas.", narrative: { clarityNeed: 2, structurePreference: 2 } },
      { id: "time-no-confusion", label: "Ter tempo para decidir sem confusão.", detail: "Menos pressão, mais controle.", narrative: { clarityNeed: 2, actionBias: -1 } },
    ],
  },
  {
    id: "readiness",
    eyebrow: "Agora, sem rodeio",
    prompt: "Se decidir começar, qual posição parece mais honesta hoje?",
    hint: "Esta resposta entra na recomendação comercial. Ela não avalia seu corpo.",
    presentation: "scenario",
    autoAdvance: true,
    options: [
      { id: "months-ready", label: "Quero organizar alguns meses e seguir.", detail: "Continuidade moderada, com menos decisões.", commercialTag: "months-ready" },
      { id: "compare-first", label: "Ainda quero comparar antes de comprar.", detail: "A oferta precisa ser simples de conferir.", commercialTag: "compare-first" },
      { id: "try-first", label: "Quero conhecer primeiro.", detail: "Um compromisso inicial menor parece mais honesto.", commercialTag: "try-first" },
      { id: "stock-ready", label: "Já decidi e prefiro reduzir reposições.", detail: "Planejamento prolongado faz sentido para mim.", commercialTag: "stock-ready" },
    ],
  },
  {
    id: "continuity",
    eyebrow: "A última decisão é logística",
    prompt: "Qual forma de continuidade combina mais com seu momento?",
    hint: "Compare reposição e horizonte — nunca promessa de eficácia.",
    presentation: "comparison",
    autoAdvance: true,
    options: [
      { id: "fewer-replacements", label: "Evitar reposições no curto prazo.", detail: "Alguns meses organizados.", commercialTag: "fewer-replacements" },
      { id: "know-first", label: "Decidir o próximo passo só depois de conhecer.", detail: "Uma etapa por vez.", commercialTag: "know-first" },
      { id: "long-stock", label: "Organizar um estoque prolongado.", detail: "Poucas reposições por mais tempo.", commercialTag: "long-stock" },
      { id: "moderate-continuity", label: "Ter continuidade sem planejar tão longe.", detail: "Equilíbrio entre estrutura e flexibilidade.", commercialTag: "moderate-continuity" },
    ],
  },
] as const satisfies readonly QuizQuestion[];

export const quizQuestionMap = Object.fromEntries(
  quizQuestions.map((question) => [question.id, question]),
) as unknown as Readonly<Record<QuizQuestionId, QuizQuestion>>;

export function getQuizOption(questionId: QuizQuestionId, optionId: string): QuizQuestion["options"][number] | null {
  return quizQuestionMap[questionId].options.find((option) => option.id === optionId) ?? null;
}
