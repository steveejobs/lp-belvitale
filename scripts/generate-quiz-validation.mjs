import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createServer } from "vite";

const root = path.resolve(".");
const outputDirectory = path.join(root, "artifacts", "quiz-v7");
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });

try {
  const { quizQuestions } = await server.ssrLoadModule("/src/features/quiz/content/questions.ts");
  const { calculateQuizResult } = await server.ssrLoadModule("/src/features/quiz/domain/quiz.scoring.ts");
  const { calculateRecommendedPlan } = await server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts");
  const { auditQuizQuestionContent } = await server.ssrLoadModule("/src/features/quiz/domain/quiz.validation.ts");

  const pick = (optionIndex) => Object.fromEntries(quizQuestions.map((question) => [
    question.id,
    (question.options[optionIndex] ?? question.options[0]).id,
  ]));
  const profiles = [
    { id: "all-first", answers: pick(0) },
    { id: "all-second", answers: pick(1) },
    { id: "all-third", answers: pick(2) },
    { id: "all-last", answers: pick(3) },
    { id: "cautious", answers: { ...pick(0), history: "disappointed", "decision-weight": "money", "future-goal": "trust" } },
    { id: "extended-ready", answers: { ...pick(0), history: "start-stop", "decision-weight": "a-path", "future-goal": "stop-restarting" } },
  ].map((profile) => ({
    ...profile,
    result: calculateQuizResult(profile.answers),
    recommendation: calculateRecommendedPlan(profile.answers),
  }));

  const contentAudit = auditQuizQuestionContent();
  const invalid = profiles.filter((profile) => profile.result === null || profile.recommendation === null);
  const extended = profiles.find((profile) => profile.id === "extended-ready");
  const pass = contentAudit.valid && invalid.length === 0 &&
    profiles.every((profile) => profile.recommendation?.offerId === "three-months") &&
    extended?.recommendation?.disposition === "extended-ready";
  const report = {
    generatedAt: new Date().toISOString(),
    quizVersion: "7.0.0",
    positioning: "interactive direct-response sales experience; não é diagnóstico",
    pass,
    testedPaths: profiles.map(({ id, result, recommendation }) => ({ id, result: result?.id, offerId: recommendation?.offerId, disposition: recommendation?.disposition })),
    invalidPaths: invalid.length,
    contentAudit,
    recommendationRule: "90 dias é o caminho central. Um sinal de recomeço + continuidade + planejamento prepara futura oferta estendida, sem inferir necessidade pelo corpo.",
  };
  const markdown = [
    "# Validação editorial — Quiz CeluClin V2",
    "",
    `Gate: **${pass ? "APROVADO" : "REPROVADO"}**. Seis caminhos intencionais, sem simulação pseudocientífica.`,
    "",
    ...report.testedPaths.map((profile) => `- ${profile.id}: ${profile.result} → ${profile.offerId} (${profile.disposition})`),
    "",
    "Aparência e intensidade física não decidem quantidade. A opção estendida permanece bloqueada até existir uma oferta comercialmente defensável.",
    "",
  ].join("\n");
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "validation.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "validation.md"), markdown, "utf8"),
  ]);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!pass) process.exitCode = 1;
} finally {
  await server.close();
}
