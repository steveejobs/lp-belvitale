import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "artifacts", "quiz-v7", "audience-simulation");
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true }, logLevel: "silent" });

try {
  const [{ quizQuestions }, { buildPersonalizedInsight, concernCopy, getConcernFromQuizAnswers }, { calculateRecommendedPlan }] = await Promise.all([
    server.ssrLoadModule("/src/features/quiz/content/questions.ts"),
    server.ssrLoadModule("/src/features/quiz/content/insights.ts"),
    server.ssrLoadModule("/src/features/quiz/domain/quiz.recommendation.ts"),
  ]);

  const ageBands = ["19–29", "30–39", "40–49", "50–59", "60+"];
  const lenses = ["cética após frustração", "rotina sobrecarregada", "confiança abalada", "decisão cautelosa", "pronta para agir"];
  let seed = 71027;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  const prohibitedClaims = /\bcura\b|elimina celulite|reduz gordura|reduz medidas|resultado garantido|aprovado pela anvisa|100% natural/i;
  const people = [];
  for (let index = 0; index < 1_000; index += 1) {
    const answers = Object.fromEntries(quizQuestions.map((question) => {
      const option = question.options[Math.floor(random() * question.options.length)];
      return [question.id, option.id];
    }));
    const concern = getConcernFromQuizAnswers(answers);
    const insightOne = buildPersonalizedInsight(1, answers);
    const insightTwo = buildPersonalizedInsight(2, answers);
    const insightThree = buildPersonalizedInsight(3, answers);
    const recommendation = calculateRecommendedPlan(answers);
    const fullCopy = [insightOne, insightTwo, insightThree]
      .flatMap((insight) => [insight.title, insight.explanation, insight.note ?? "", ...insight.signals])
      .join(" ");

    const checks = {
      painSpecificity: insightOne.explanation.includes(concernCopy[concern].noun),
      answerEcho: insightOne.signals.length === 3 && insightTwo.signals.length >= 2,
      emotionalRecognition: insightTwo.title.length >= 55 && /incômodo|espelho|confiança|rotina|frustrar|pele/i.test(insightTwo.title),
      futureTransformation: insightThree.note?.length > 45 && /aparência|presença|corpo|continuidade|segura|escolher/i.test(`${insightThree.note} ${insightThree.signals.join(" ")}`),
      trustAndSafety: !prohibitedClaims.test(fullCopy),
      commercialContinuity: recommendation?.offerId === "three-months" && recommendation.reasons.length === 2,
      readableDensity: Math.max(insightOne.explanation.length, insightTwo.explanation.length, insightThree.explanation.length) <= 520,
    };
    const score = Object.values(checks).filter(Boolean).length;
    people.push({
      id: index + 1,
      ageBand: ageBands[index % ageBands.length],
      lens: lenses[(index * 3) % lenses.length],
      concern,
      answers,
      checks,
      score,
      approved: score >= 6,
    });
  }

  const approved = people.filter((person) => person.approved).length;
  const approvalRate = Number((approved / people.length * 100).toFixed(1));
  const concerns = Object.fromEntries(Object.keys(concernCopy).map((concern) => [concern, people.filter((person) => person.concern === concern).length]));
  const checks = Object.fromEntries(Object.keys(people[0].checks).map((check) => [check, people.filter((person) => person.checks[check]).length]));
  const report = {
    generatedAt: new Date().toISOString(),
    method: "Simulação heurística determinística; não substitui pesquisa com consumidoras reais.",
    sampleSize: people.length,
    approvalThreshold: "6 de 7 critérios estruturais por perfil",
    targetApprovalRate: 80,
    approved,
    approvalRate,
    passed: approvalRate >= 80,
    ageBands: Object.fromEntries(ageBands.map((band) => [band, people.filter((person) => person.ageBand === band).length])),
    audienceLenses: Object.fromEntries(lenses.map((lens) => [lens, people.filter((person) => person.lens === lens).length])),
    concerns,
    checks,
    rejectedExamples: people.filter((person) => !person.approved).slice(0, 20),
  };
  const markdown = [
    "# Simulação heurística de audiência — Quiz Belvitale",
    "",
    `Resultado: **${report.passed ? "APROVADO" : "REPROVADO"}** — ${approvalRate}% (${approved}/${people.length}) dos perfis atingiram ao menos 6 de 7 critérios.`,
    "",
    "> Esta é uma inspeção automatizada de relevância, personalização, segurança e continuidade comercial. Não é uma pesquisa, entrevista ou teste de conversão com mulheres reais.",
    "",
    "## Cobertura",
    "",
    `- Faixas etárias simuladas: ${JSON.stringify(report.ageBands)}`,
    `- Lentes de decisão: ${JSON.stringify(report.audienceLenses)}`,
    `- Dores selecionadas: ${JSON.stringify(concerns)}`,
    "",
    "## Critérios aprovados",
    "",
    ...Object.entries(checks).map(([name, count]) => `- ${name}: ${count}/1000`),
    "",
  ].join("\n");

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8"),
    writeFile(path.join(outputDirectory, "report.md"), markdown, "utf8"),
  ]);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
} finally {
  await server.close();
}
