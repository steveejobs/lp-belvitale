import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "artifacts", "quiz-v6");
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });

const countBy = (values) => Object.fromEntries([...new Set(values)].sort().map((value) => [
  value,
  values.filter((candidate) => candidate === value).length,
]));
const pct = (count, total) => Number((count / total * 100).toFixed(2));

try {
  const questionsModule = await server.ssrLoadModule("/src/features/quiz/content/questions.ts");
  const profilesModule = await server.ssrLoadModule("/src/features/quiz/content/profiles.ts");
  const scoringModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
  const recommendationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts");
  const validationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.validation.ts");
  const { quizQuestions } = questionsModule;
  const { quizProfileOrder } = profilesModule;
  const { calculateQuizResult } = scoringModule;
  const { calculateRecommendedPlan } = recommendationModule;
  const { auditQuizQuestionContent } = validationModule;

  const combinations = [];
  const walk = (index, answers) => {
    const question = quizQuestions[index];
    if (question === undefined) {
      combinations.push(answers);
      return;
    }
    for (const option of question.options) {
      walk(index + 1, { ...answers, [question.id]: option.id });
    }
  };
  walk(0, {});

  const evaluated = combinations.map((answers) => ({
    answers,
    result: calculateQuizResult(answers),
    recommendation: calculateRecommendedPlan(answers),
  }));
  const invalid = evaluated.filter((item) => item.result === null || item.recommendation === null);
  const valid = evaluated.filter((item) => item.result !== null && item.recommendation !== null);
  const profileDistribution = countBy(valid.map((item) => item.result.id));
  const offerDistribution = countBy(valid.map((item) => item.recommendation.offerId));
  const ties = valid.filter((item) => {
    const distances = Object.values(item.result.distances).sort((a, b) => a - b);
    return Math.abs(distances[0] - distances[1]) < 1e-10;
  }).length;

  const commercialQuestionIds = new Set(["readiness", "continuity"]);
  let irrelevantRecommendationChanges = 0;
  let concernRecommendationChanges = 0;
  const singleAnswerTransitions = {};
  for (const item of valid) {
    for (const question of quizQuestions) {
      for (const option of question.options) {
        if (option.id === item.answers[question.id]) continue;
        const next = calculateRecommendedPlan({ ...item.answers, [question.id]: option.id });
        if (next?.offerId !== item.recommendation.offerId) {
          singleAnswerTransitions[question.id] = (singleAnswerTransitions[question.id] ?? 0) + 1;
          if (!commercialQuestionIds.has(question.id)) irrelevantRecommendationChanges += 1;
          if (question.id === "concern") concernRecommendationChanges += 1;
        }
      }
    }
  }

  const readiness = quizQuestions.find((question) => question.id === "readiness");
  const continuity = quizQuestions.find((question) => question.id === "continuity");
  const baseline = Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[0].id]));
  const commercialMatrix = readiness.options.flatMap((left) => continuity.options.map((right) => {
    const answers = { ...baseline, readiness: left.id, continuity: right.id };
    const recommendation = calculateRecommendedPlan(answers);
    return {
      readiness: left.id,
      continuity: right.id,
      offerId: recommendation.offerId,
      reasons: recommendation.reasons,
    };
  }));

  const shares = Object.fromEntries(Object.entries(offerDistribution).map(([id, count]) => [id, pct(count, valid.length)]));
  const profileShares = Object.fromEntries(Object.entries(profileDistribution).map(([id, count]) => [id, pct(count, valid.length)]));
  const profileExamples = Object.fromEntries(quizProfileOrder.map((id) => [
    id,
    valid.find((item) => item.result.id === id)?.answers ?? null,
  ]));
  const offerExamples = Object.fromEntries(["one-month", "three-months", "seven-months"].map((id) => [
    id,
    valid.find((item) => item.recommendation.offerId === id)?.answers ?? null,
  ]));
  const maximumOfferShare = Math.max(...Object.values(shares));
  const contentAudit = auditQuizQuestionContent();
  const allProfilesCovered = quizProfileOrder.every((id) => (profileDistribution[id] ?? 0) > 0);
  const pass =
    combinations.length >= 10_000 &&
    invalid.length === 0 &&
    irrelevantRecommendationChanges === 0 &&
    concernRecommendationChanges === 0 &&
    maximumOfferShare <= 70 &&
    allProfilesCovered &&
    contentAudit.valid;

  const report = {
    generatedAt: new Date().toISOString(),
    quizVersion: "6.0.0",
    pass,
    totalCombinations: combinations.length,
    invalidCombinations: invalid.length,
    profileDistribution,
    profileShares,
    offerDistribution,
    offerShares: shares,
    profileExamples,
    offerExamples,
    maximumOfferShare,
    exactProfileTies: ties,
    irrelevantRecommendationChanges,
    concernRecommendationChanges,
    singleAnswerTransitions,
    allProfilesCovered,
    contentAudit,
    commercialMatrix,
  };

  const distributionRows = (distribution, total) => Object.entries(distribution)
    .map(([id, count]) => `| ${id} | ${count} | ${pct(count, total)}% |`)
    .join("\n");
  const markdown = [
    "# Validação de pontuação e recomendação — Quiz CeluClin 6.0",
    "",
    `Gerado em ${report.generatedAt}. Gate: **${pass ? "APROVADO" : "REPROVADO"}**.`,
    "",
    "## Cobertura",
    "",
    `- Combinações válidas: **${combinations.length}**`,
    `- Combinações inválidas: **${invalid.length}**`,
    `- Mudanças de kit causadas por respostas não comerciais: **${irrelevantRecommendationChanges}**`,
    `- Mudanças de kit causadas pela preocupação visual: **${concernRecommendationChanges}**`,
    `- Empates exatos de perfil: **${ties}**`,
    "",
    "## Distribuição de perfis",
    "",
    "| Perfil | Combinações | Participação |",
    "| --- | ---: | ---: |",
    distributionRows(profileDistribution, valid.length),
    "",
    "## Distribuição de recomendações",
    "",
    "| Oferta | Combinações | Participação |",
    "| --- | ---: | ---: |",
    distributionRows(offerDistribution, valid.length),
    "",
    "A distribuição comercial é determinada somente por prontidão e continuidade declaradas. A preocupação visual altera apenas copy e ordem da prova.",
    "",
    "## Matriz comercial de fronteira",
    "",
    "| Prontidão | Continuidade | Oferta | Justificativa |",
    "| --- | --- | --- | --- |",
    ...commercialMatrix.map((row) => `| ${row.readiness} | ${row.continuity} | ${row.offerId} | ${row.reasons.join(" ")} |`),
    "",
  ].join("\n");

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "validation.json"), JSON.stringify(report, null, 2) + "\n", "utf8"),
    writeFile(path.join(outputDirectory, "validation.md"), markdown, "utf8"),
  ]);
  process.stdout.write(JSON.stringify({
    pass,
    totalCombinations: report.totalCombinations,
    profileShares,
    offerShares: shares,
    irrelevantRecommendationChanges,
    concernRecommendationChanges,
  }, null, 2) + "\n");
  if (!pass) process.exitCode = 1;
} finally {
  await server.close();
}
