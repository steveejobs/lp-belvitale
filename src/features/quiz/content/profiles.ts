import type {
  QuizProfileContent,
  QuizProfileId,
} from "../domain/quiz.types";

export const quizProfiles: Readonly<Record<QuizProfileId, QuizProfileContent>> = {
  "fresta-no-dia": {
    id: "fresta-no-dia",
    name: "Uma fresta no dia",
    recognition:
      "Você não precisa transformar o cuidado no centro da vida; precisa encontrar uma abertura pequena que não desapareça quando o dia muda.",
    starts:
      "Seu começo tende a acontecer quando a escolha parece leve, possível e sem uma estrutura grande demais.",
    interruptionRisk:
      "O principal risco é depender do embalo inicial: quando a agenda aperta, o cuidado pode perder lugar antes de ganhar uma pista concreta.",
    maintenance:
      "Mantenha uma única âncora visível e reduza a decisão diária: mesmo lugar, mesma pista, próximo passo pequeno.",
    sevenDayRitual: [
      "Escolha uma pista visual para a rotina.",
      "Observe em que momento ela foi fácil de notar.",
      "Retire um passo desnecessário do caminho.",
      "Se houver pausa, retome na próxima oportunidade.",
      "Revise uma informação que ainda gere dúvida.",
      "Repita o gesto no mesmo contexto.",
      "Decida o que vale manter — sem exigir perfeição.",
    ],
    proofHelp:
      "Você tende a decidir melhor com informação direta, curta e fácil de revisar antes do compromisso.",
    center: {
      dailyImpact: 72,
      routineFriction: 62,
      startStyle: 18,
      recoveryCapacity: 48,
      proofPreference: 44,
    },
  },
  "fio-que-volta": {
    id: "fio-que-volta",
    name: "O fio que se retoma",
    recognition:
      "Seu ritmo não é uma linha reta — e isso não o torna menos válido. O que sustenta a rotina é saber voltar sem transformar uma pausa em abandono.",
    starts:
      "Você costuma começar quando consegue encaixar o cuidado na vida como ela está, ajustando enquanto avança.",
    interruptionRisk:
      "Dias cheios podem quebrar a sequência; o risco aparece quando a pausa passa a parecer um recomeço completo.",
    maintenance:
      "Defina uma regra de retorno simples: perdeu um dia, volte na próxima oportunidade disponível, sem compensação e sem culpa.",
    sevenDayRitual: [
      "Nomeie a oportunidade mais fácil do dia.",
      "Use essa oportunidade como ponto de retorno.",
      "Anote qual fricção apareceu de verdade.",
      "Diminua a rotina até ela caber nesse dia.",
      "Volte sem tentar compensar uma pausa.",
      "Reconheça a retomada, não a sequência.",
      "Mantenha a regra de retorno para a semana seguinte.",
    ],
    proofHelp:
      "Você ganha confiança quando a informação mostra limites e permite revisar a escolha sem pressão.",
    center: {
      dailyImpact: 42,
      routineFriction: 74,
      startStyle: 44,
      recoveryCapacity: 82,
      proofPreference: 48,
    },
  },
  "ancora-leve": {
    id: "ancora-leve",
    name: "Uma âncora leve",
    recognition:
      "Você se move melhor quando o cuidado ganha um lugar reconhecível — firme o bastante para ser lembrado, leve o bastante para não pesar.",
    starts:
      "Um horário, um objeto ou um gesto já existente costuma transformar intenção em começo para você.",
    interruptionRisk:
      "A rotina perde força quando fica invisível ou exige etapas demais para ser retomada.",
    maintenance:
      "Associe o cuidado a algo que já acontece todos os dias e deixe o necessário ao alcance dos olhos.",
    sevenDayRitual: [
      "Escolha um gesto diário que já existe.",
      "Coloque a pista da nova rotina perto dele.",
      "Teste se o acesso exige menos de um minuto.",
      "Ajuste o lugar se a pista ficou invisível.",
      "Revise as informações essenciais da escolha.",
      "Repita sem adicionar novos passos.",
      "Mantenha somente a âncora que funcionou.",
    ],
    proofHelp:
      "Comparações organizadas e informações objetivas ajudam você a transformar dúvida em um próximo passo claro.",
    center: {
      dailyImpact: 52,
      routineFriction: 68,
      startStyle: 88,
      recoveryCapacity: 56,
      proofPreference: 58,
    },
  },
  "olhar-de-lupa": {
    id: "olhar-de-lupa",
    name: "Olhar de lupa",
    recognition:
      "Sua confiança não nasce de pressa. Ela aparece quando critérios, origem e limites ficam visíveis o bastante para você formar a própria leitura.",
    starts:
      "Você tende a começar depois de entender o que está escolhendo e por que aquilo faz sentido para o seu momento.",
    interruptionRisk:
      "Informação incompleta ou uma promessa maior do que a evidência podem interromper a rotina antes mesmo de ela se consolidar.",
    maintenance:
      "Guarde uma fonte objetiva de consulta e defina antecipadamente quais dúvidas realmente precisam ser respondidas.",
    sevenDayRitual: [
      "Liste as duas informações essenciais para decidir.",
      "Confira rótulo, modo de uso e avisos.",
      "Separe fato documentado de expectativa.",
      "Escolha uma pista simples para a rotina.",
      "Observe se surgiu uma dúvida nova.",
      "Revise somente a fonte necessária.",
      "Decida com os limites da evidência visíveis.",
    ],
    proofHelp:
      "Rótulo, critérios comparáveis e mídia autorizada em tamanho legível ajudam mais do que frases de efeito.",
    center: {
      dailyImpact: 38,
      routineFriction: 42,
      startStyle: 58,
      recoveryCapacity: 42,
      proofPreference: 92,
    },
  },
};

export const quizProfileOrder: readonly QuizProfileId[] = [
  "fresta-no-dia",
  "fio-que-volta",
  "ancora-leve",
  "olhar-de-lupa",
];
