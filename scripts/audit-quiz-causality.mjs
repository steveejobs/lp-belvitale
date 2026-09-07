import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createServer } from "vite";

const root = path.resolve(".");
const output = path.join(root, "artifacts", "premium-cro-v2-baseline", "recommendation-causality.json");
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });

const cartesian = (arrays) => arrays.reduce((rows, values) => rows.flatMap((row) => values.map((value) => [...row, value])), [[]]);

try {
  const { quizQuestions } = await server.ssrLoadModule("/src/features/quiz/content/questions.ts");
  const { calculateQuizResult } = await server.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
  const { calculateRecommendedPlan } = await server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts");
  const defaults = Object.fromEntries(quizQuestions.map((question) => [question.id, question.options[0].id]));
  const commercial = quizQuestions.filter((question) => ["history", "decision-weight", "future-goal"].includes(question.id));
  const commercialRows = cartesian(commercial.map((question) => question.options.map((option) => option.id))).map((values) => {
    const answers = { ...defaults, ...Object.fromEntries(commercial.map((question, index) => [question.id, values[index]])) };
    return { answers, recommendation: calculateRecommendedPlan(answers) };
  });

  const narrativeQuestions = quizQuestions.filter((question) => question.options.some((option) => option.narrative));
  const causalRows = [];
  for (const question of quizQuestions) {
    for (const option of question.options) {
      const otherNarrative = narrativeQuestions.filter((candidate) => candidate.id !== question.id);
      const combinations = cartesian(otherNarrative.map((candidate) => candidate.options.map((item) => item.id)));
      const profiles = {};
      for (const values of combinations) {
        const sample = {
          ...defaults,
          ...Object.fromEntries(otherNarrative.map((candidate, index) => [candidate.id, values[index]])),
          [question.id]: option.id,
        };
        const profile = calculateQuizResult(sample)?.id;
        if (profile) profiles[profile] = (profiles[profile] ?? 0) + 1;
      }
      const recommendationRows = commercialRows.filter((row) => !commercial.some((candidate) => candidate.id === question.id) || row.answers[question.id] === option.id);
      const offerCounts = Object.fromEntries(["one-month", "three-months"].map((id) => [id, recommendationRows.filter((row) => row.recommendation?.offerId === id).length]));
      const magnitude = Math.sqrt(Object.values(option.narrative ?? {}).reduce((sum, value) => sum + value ** 2, 0));
      causalRows.push({
        questionId: question.id,
        answerId: option.id,
        dimensionDelta: option.narrative ?? {},
        profileDistribution: profiles,
        recommendationDistribution: offerCounts,
        magnitude: Math.round(magnitude * 100) / 100,
      });
    }
  }

  const cautiousAnswers = {
    history: new Set(["research", "disappointed"]),
    "decision-weight": new Set(["money", "expectation"]),
    "future-goal": new Set(["trust"]),
  };
  const cautiousEnding90 = commercialRows.filter((row) => {
    const cautionCount = Object.entries(cautiousAnswers).filter(([id, ids]) => ids.has(row.answers[id])).length;
    return cautionCount >= 2 && row.recommendation?.offerId === "three-months";
  }).map((row) => ({
    history: row.answers.history,
    decisionWeight: row.answers["decision-weight"],
    futureGoal: row.answers["future-goal"],
    recommendation: row.recommendation?.offerId,
  }));
  const report = {
    generatedAt: new Date().toISOString(),
    exactCommercialCombinations: commercialRows.length,
    distribution: {
      "one-month": commercialRows.filter((row) => row.recommendation?.offerId === "one-month").length,
      "three-months": commercialRows.filter((row) => row.recommendation?.offerId === "three-months").length,
    },
    structuralBias: "A regra atual exige a conjunção história cautelosa + decisão cautelosa; future-goal altera a justificativa, mas nunca altera a oferta.",
    cautiousEnding90,
    rows: causalRows,
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ output, distribution: report.distribution, cautiousEnding90: cautiousEnding90.length, rows: causalRows.length }, null, 2)}\n`);
} finally {
  await server.close();
}
