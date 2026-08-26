import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "artifacts", "quiz-v7");
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });

try {
  const questionsModule = await server.ssrLoadModule("/src/features/quiz/content/questions.ts");
  const scoringModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
  const recommendationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts");
  const validationModule = await server.ssrLoadModule("/src/features/quiz/domain/quiz.validation.ts");
  const { quizQuestions } = questionsModule;
  const { calculateQuizResult } = scoringModule;
  const { calculateRecommendedPlan } = recommendationModule;
  const { auditQuizQuestionContent } = validationModule;

  const sampleSize = 10_000;
  let seed = 7;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const evaluated = [];
  for (let index = 0; index < sampleSize; index += 1) {
    const answers = Object.fromEntries(quizQuestions.map((question) => {
      const option = question.options[Math.floor(random() * question.options.length)];
      return [question.id, option.id];
    }));
    evaluated.push({ answers, result: calculateQuizResult(answers), recommendation: calculateRecommendedPlan(answers) });
  }

  const invalid = evaluated.filter((item) => item.result === null || item.recommendation === null);
  const profiles = Object.fromEntries([...new Set(evaluated.map((item) => item.result?.id))].map((id) => [id, evaluated.filter((item) => item.result?.id === id).length]));
  const offers = Object.fromEntries([...new Set(evaluated.map((item) => item.recommendation?.offerId))].map((id) => [id, evaluated.filter((item) => item.recommendation?.offerId === id).length]));
  const contentAudit = auditQuizQuestionContent();
  const commercialCombinations = quizQuestions
    .filter((question) => ["history", "decision-weight", "future-goal"].includes(question.id))
    .reduce((total, question) => total * question.options.length, 1);
  const pass = invalid.length === 0 && contentAudit.valid && offers["three-months"] === sampleSize;
  const report = {
    generatedAt: new Date().toISOString(),
    quizVersion: "7.0.0",
    pass,
    sampleSize,
    totalQuestions: quizQuestions.length,
    commercialCombinations,
    invalidCombinations: invalid.length,
    profileDistribution: profiles,
    offerDistribution: offers,
    contentAudit,
    recommendationRule: "90 dias é uma sugestão editorial de constância; não é inferida da preocupação corporal.",
  };
  const markdown = [
    "# Validação de conteúdo e recomendação — Quiz CeluClin 7.0",
    "",
    `Gate: **${pass ? "APROVADO" : "REPROVADO"}**. Amostra determinística: ${sampleSize} combinações.`,
    "",
    `- Perguntas: **${quizQuestions.length}**`,
    `- Combinações comerciais cobertas: **${commercialCombinations}**`,
    `- Combinações inválidas: **${invalid.length}**`,
    `- Ofertas na amostra: **${JSON.stringify(offers)}**`,
    "",
    "A recomendação de 90 dias organiza a continuidade narrativa do documento e não usa aparência, corpo ou preocupação visual para decidir quantidade.",
    "",
  ].join("\n");
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "validation.json"), JSON.stringify(report, null, 2) + "\n", "utf8"),
    writeFile(path.join(outputDirectory, "validation.md"), markdown, "utf8"),
  ]);
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  if (!pass) process.exitCode = 1;
} finally {
  await server.close();
}
