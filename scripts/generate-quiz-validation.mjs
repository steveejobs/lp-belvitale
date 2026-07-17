import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "artifacts", "quiz-v4");
const server = await createServer({
  root,
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "silent",
});

const percentage = (count, total) => `${(count / total * 100).toFixed(2)}%`;
const countBy = (values) => Object.fromEntries(
  [...new Set(values)].sort().map((value) => [
    value,
    values.filter((candidate) => candidate === value).length,
  ]),
);

try {
  const questionsModule = await server.ssrLoadModule("/src/features/quiz/content/questions.ts");
  const profilesModule = await server.ssrLoadModule("/src/features/quiz/content/profiles.ts");
  const offersModule = await server.ssrLoadModule("/src/features/quiz/content/offers.ts");
  const scoringModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
  const recommendationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts");
  const validationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.validation.ts");

  const { quizQuestions, quizQuestionMap } = questionsModule;
  const { quizProfiles, quizProfileOrder } = profilesModule;
  const { quizOffers, quizOfferOrder } = offersModule;
  const { calculateQuizResult, calculateDimensionVector, getDimensionRanges } = scoringModule;
  const { calculateRecommendedPlan, deriveCommercialSignals } = recommendationModule;
  const { auditQuizQuestionContent, hasCompleteQuizAnswers } = validationModule;

  const combinations = [];
  const walk = (index, answers) => {
    const question = quizQuestions[index];
    if (question === undefined) {
      combinations.push(answers);
      return;
    }
    question.options.forEach((option) => {
      walk(index + 1, { ...answers, [question.id]: option.id });
    });
  };
  walk(0, {});

  const evaluated = combinations.map((answers) => ({
    answers,
    result: calculateQuizResult(answers),
    recommendation: calculateRecommendedPlan(answers),
    signals: deriveCommercialSignals(answers),
    dimensions: calculateDimensionVector(answers),
  }));
  const invalidPaths = evaluated.filter(({ result, recommendation }) => result === null || recommendation === null);
  const valid = evaluated.filter(({ result, recommendation }) => result !== null && recommendation !== null);
  const profileDistribution = countBy(valid.map(({ result }) => result.profile));
  const planDistribution = countBy(valid.map(({ recommendation }) => recommendation.plan));
  const maximumPlanShare = Math.max(...Object.values(planDistribution)) / valid.length;
  const maximumProfileShare = Math.max(...Object.values(profileDistribution)) / valid.length;

  const commercialMatrix = [];
  const planningQuestion = quizQuestionMap["planning-horizon"];
  const commitmentQuestion = quizQuestionMap["honest-commitment"];
  for (const planning of planningQuestion.options) {
    for (const commitment of commitmentQuestion.options) {
      const answers = {
        ...Object.fromEntries(quizQuestions.slice(0, 5).map((question) => [question.id, question.options[0].id])),
        "planning-horizon": planning.id,
        "honest-commitment": commitment.id,
      };
      const recommendation = calculateRecommendedPlan(answers);
      commercialMatrix.push({
        planning: planning.id,
        commitment: commitment.id,
        plan: recommendation?.plan ?? null,
        reasons: recommendation?.reasons ?? [],
      });
    }
  }

  let irrelevantPlanChanges = 0;
  const irrelevantExamples = [];
  const commercialGroups = new Map();
  valid.forEach((candidate) => {
    const key = `${candidate.answers["planning-horizon"]}:${candidate.answers["honest-commitment"]}`;
    const plans = commercialGroups.get(key) ?? new Set();
    plans.add(candidate.recommendation.plan);
    commercialGroups.set(key, plans);
  });
  commercialGroups.forEach((plans, key) => {
    if (plans.size > 1) {
      irrelevantPlanChanges += 1;
      irrelevantExamples.push({ key, plans: [...plans] });
    }
  });

  const invalid210 = valid.filter(({ answers, recommendation }) =>
    recommendation.plan === "210-days" &&
    (
      answers["honest-commitment"] !== "explicit-long-commitment" ||
      answers["planning-horizon"] === "one-step-first"
    ),
  );
  const invalid30 = valid.filter(({ answers, recommendation }) =>
    recommendation.plan === "30-days" &&
    answers["honest-commitment"] !== "try-before-continuity" &&
    answers["honest-commitment"] !== "not-ready-to-buy",
  );
  const resultTies = valid.filter(({ result }) => {
    const distances = Object.values(result.distances).sort((left, right) => left - right);
    return distances[0] === distances[1];
  }).length;

  const contentAudit = auditQuizQuestionContent();
  const incompleteAnswers = Object.fromEntries(Object.entries(combinations[0]).slice(1));
  const noResultForIncomplete =
    calculateQuizResult(incompleteAnswers) === null &&
    !hasCompleteQuizAnswers(incompleteAnswers);
  const allPlansCovered = quizOfferOrder.every((plan) => (planDistribution[plan] ?? 0) > 0);
  const pass =
    combinations.length >= 10_000 &&
    invalidPaths.length === 0 &&
    contentAudit.valid &&
    maximumPlanShare <= 0.7 &&
    maximumProfileShare <= 0.7 &&
    irrelevantPlanChanges === 0 &&
    invalid210.length === 0 &&
    invalid30.length === 0 &&
    noResultForIncomplete &&
    allPlansCovered;

  const matrix = quizQuestions.map((question) => ({
    id: question.id,
    commercial: question.commercial,
    presentation: question.presentation,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      impact: option.impact,
    })),
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    quizVersion: "4.0.0",
    pass,
    totalCombinations: combinations.length,
    invalidPaths: invalidPaths.length,
    profileDistribution,
    planDistribution,
    maximumProfileShare,
    maximumPlanShare,
    resultTies,
    irrelevantPlanChanges,
    irrelevantExamples,
    invalid210Recommendations: invalid210.length,
    invalid30Recommendations: invalid30.length,
    noResultForIncomplete,
    allPlansCovered,
    contentAudit,
    dimensionRanges: getDimensionRanges(),
    commercialMatrix,
    matrix,
    profiles: Object.fromEntries(quizProfileOrder.map((id) => [id, quizProfiles[id]])),
    offers: Object.fromEntries(quizOfferOrder.map((id) => [id, quizOffers[id]])),
  };

  const distributionRows = (distribution) => Object.entries(distribution)
    .map(([key, count]) => `| ${key} | ${count} | ${percentage(count, valid.length)} |`)
    .join("\n");
  const validationMarkdown = [
    "# Validação do quiz narrativo Belvitale v4",
    "",
    `Gerado em ${report.generatedAt}. Resultado do gate: **${pass ? "APROVADO" : "REPROVADO"}**.`,
    "",
    "## Cobertura",
    "",
    `- Combinações válidas simuladas: **${combinations.length}**`,
    `- Caminhos inválidos: **${invalidPaths.length}**`,
    `- Mudanças de kit causadas por respostas não comerciais: **${irrelevantPlanChanges}**`,
    `- Recomendações inválidas de 210 dias: **${invalid210.length}**`,
    `- Recomendações inválidas de 30 dias: **${invalid30.length}**`,
    `- Empates de distância de perfil resolvidos de modo determinístico: **${resultTies}**`,
    `- Caminho incompleto produz resultado: **${noResultForIncomplete ? "não" : "sim"}**`,
    "",
    "## Distribuição de perfis",
    "",
    "| Perfil | Combinações | Participação |",
    "| --- | ---: | ---: |",
    distributionRows(profileDistribution),
    "",
    "## Distribuição das recomendações",
    "",
    "| Opção | Combinações | Participação |",
    "| --- | ---: | ---: |",
    distributionRows(planDistribution),
    "",
    `Maior participação de uma opção: **${percentage(Math.max(...Object.values(planDistribution)), valid.length)}**. O gate reprova acima de 70%.`,
    "",
    "## Isolamento comercial",
    "",
    "As cinco primeiras perguntas podem mudar perfil, linguagem, insight e ritual, mas não a duração. A recomendação lê somente as dimensões permitidas, derivadas das perguntas `planning-horizon` e `honest-commitment`.",
    "",
    "210 dias aparece apenas quando há declaração explícita de compromisso prolongado e não existe a resposta contraditória de testar um passo antes. Nenhuma dimensão corporal participa dessa regra.",
    "",
  ].join("\n");

  const dimensionIds = Object.keys(report.dimensionRanges);
  const scoringMarkdown = [
    "# Matriz de pontuação — quiz Belvitale v4",
    "",
    "Cada alternativa altera duas ou mais dimensões. Valores ausentes equivalem a zero. Perfil e recomendação comercial são calculados separadamente.",
    "",
    `| Pergunta | Comercial | Resposta | ${dimensionIds.join(" | ")} |`,
    `| --- | --- | --- | ${dimensionIds.map(() => "---:").join(" | ")} |`,
    ...matrix.flatMap((question) => question.options.map((option) =>
      `| ${question.id} | ${question.commercial ? "sim" : "não"} | ${option.id} | ${dimensionIds.map((dimension) => option.impact[dimension] ?? 0).join(" | ")} |`,
    )),
    "",
    "As dimensões de impacto corporal personalizam apenas a linguagem. A duração usa compromisso declarado, preferência de continuidade, planejamento, conveniência de reposição e prontidão de compra.",
    "",
  ].join("\n");

  const questionMapMarkdown = [
    "# Mapa narrativo de perguntas e dimensões",
    "",
    "| Momento | Tipo | Conteúdo | Função |",
    "| ---: | --- | --- | --- |",
    "| 1 | introdução | A vida antes da rotina | Expõe duração, privacidade e presença da oferta |",
    "| 2 | pergunta 1 | Cena de roupa/foto | Impacto cotidiano, sem medir gravidade |",
    "| 3 | pergunta 2 | Forma de começar | Estilo de começo e prova |",
    "| 4 | microinsight | Como o começo acontece | Recompensa derivada de Q1 + Q2 |",
    "| 5 | pergunta 3 | Fricção concreta | O que ameaça a constância |",
    "| 6 | história | Entre começo e retorno | Mudança de ritmo visual |",
    "| 7 | pergunta 4 | Depois de um dia perdido | Capacidade de retomada |",
    "| 8 | pergunta 5 | Informação que gera confiança | Preferência de prova |",
    "| 9 | prova + microinsight | Arquivo autorizado e limites | Q3 + Q5, sem atribuição causal |",
    "| 10 | pergunta 6 | Horizonte de planejamento | Primeira entrada comercial declarada |",
    "| 11 | pergunta 7 | Compromisso honesto | Declaração principal para a oferta |",
    "| 12 | antecipação | Trilhas separadas | Explica perfil versus oferta |",
    "| 13 | resultado | Perfil, ritual, revisão e prova | Leitura completa sem diagnóstico |",
    "| 14 | oferta | Recomendação e comparação | Venda identificada e checkout transparente |",
    "",
    "## Dimensões ocultas",
    "",
    "- `dailyImpact`: impacto emocional nas escolhas cotidianas; só personaliza linguagem.",
    "- `routineFriction`: principal fricção da rotina.",
    "- `startStyle`: forma de começar.",
    "- `recoveryCapacity`: capacidade de retomar.",
    "- `planningHorizon`: horizonte de planejamento.",
    "- `proofPreference`: preferência por informação e prova.",
    "- `replacementTolerance`: preferência por menos reposições.",
    "- `commitmentComfort`: compromisso confortável.",
    "- `purchaseReadiness`: prontidão para comprar.",
    "- `continuityPreference`: preferência de continuidade.",
    "",
  ].join("\n");

  const commercialMatrixMarkdown = [
    "# Matriz de decisão comercial",
    "",
    "| Planejamento | Compromisso declarado | Recomendação |",
    "| --- | --- | --- |",
    ...commercialMatrix.map((row) => `| ${row.planning} | ${row.commitment} | ${row.plan} |`),
    "",
    "A matriz contém todas as 16 combinações de fronteira das duas perguntas comerciais. As demais 1.024 combinações comportamentais repetem exatamente a mesma decisão para cada célula.",
    "",
  ].join("\n");

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "validation.json"), JSON.stringify(report, null, 2)),
    writeFile(path.join(outputDirectory, "validation.md"), validationMarkdown),
    writeFile(path.join(outputDirectory, "scoring-matrix.md"), scoringMarkdown),
    writeFile(path.join(outputDirectory, "question-map.md"), questionMapMarkdown),
    writeFile(path.join(outputDirectory, "commercial-decision-matrix.md"), commercialMatrixMarkdown),
  ]);

  process.stdout.write(JSON.stringify({
    pass,
    totalCombinations: combinations.length,
    profileDistribution,
    planDistribution,
    maximumProfileShare,
    maximumPlanShare,
    irrelevantPlanChanges,
    invalid210Recommendations: invalid210.length,
  }, null, 2));
  if (!pass) process.exitCode = 1;
} finally {
  await server.close();
}
