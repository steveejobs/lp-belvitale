import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "artifacts", "quiz-v3");
const server = await createServer({
  root,
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "silent",
});

try {
  const questionsModule = await server.ssrLoadModule("/src/data/quizQuestions.ts");
  const profilesModule = await server.ssrLoadModule("/src/data/quizProfiles.ts");
  const adaptiveModule = await server.ssrLoadModule("/src/quiz/quizAdaptive.ts");
  const scoringModule = await server.ssrLoadModule("/src/quiz/quizScoring.ts");
  const recommendationModule = await server.ssrLoadModule("/src/quiz/quizRecommendation.ts");

  const {
    commonQuizQuestions,
    adaptiveQuizQuestions,
    quizQuestions,
    quizDimensionIds,
  } = questionsModule;
  const { quizProfileOrder, quizProfiles } = profilesModule;
  const { getAdaptiveCoverage, getQuizQuestionPath } = adaptiveModule;
  const { calculateQuizResult, hasCompleteQuizAnswers } = scoringModule;
  const { calculateRecommendedPlan, quizPlanOrder, quizPlanDefinitions } = recommendationModule;

  const choicesFor = (question) =>
    question.options.map((option) => ({
      questionId: question.id,
      optionId: option.id,
    }));
  const [first, second, third] = commonQuizQuestions;
  const combinations = [];
  for (const answer1 of choicesFor(first)) {
    for (const answer2 of choicesFor(second)) {
      for (const answer3 of choicesFor(third)) {
        const early = [answer1, answer2, answer3];
        const pathQuestions = getQuizQuestionPath(early);
        for (const answer4 of choicesFor(pathQuestions[3])) {
          for (const answer5 of choicesFor(pathQuestions[4])) {
            for (const answer6 of choicesFor(pathQuestions[5])) {
              combinations.push([...early, answer4, answer5, answer6]);
            }
          }
        }
      }
    }
  }

  const evaluated = combinations.map((answers) => {
    const result = calculateQuizResult(answers);
    const plan = calculateRecommendedPlan(result.dimensions);
    return { answers, result, plan };
  });
  const countBy = (values) =>
    Object.fromEntries(
      [...new Set(values)].sort().map((value) => [
        value,
        values.filter((candidate) => candidate === value).length,
      ]),
    );
  const profileDistribution = countBy(evaluated.map(({ result }) => result.profile));
  const planDistribution = countBy(evaluated.map(({ plan }) => plan.plan));
  const confidenceDistribution = countBy(evaluated.map(({ result }) => result.confidence));
  const branchDistribution = countBy(
    evaluated.map(({ answers }) => getQuizQuestionPath(answers)[3].id),
  );
  const dimensionStats = Object.fromEntries(
    quizDimensionIds.map((dimension) => {
      const values = evaluated
        .map(({ result }) => result.dimensions[dimension])
        .sort((left, right) => left - right);
      const quantile = (ratio) => values[Math.floor((values.length - 1) * ratio)];
      return [dimension, {
        minimum: values[0],
        p25: quantile(0.25),
        median: quantile(0.5),
        p75: quantile(0.75),
        maximum: values.at(-1),
        mean: values.reduce((total, value) => total + value, 0) / values.length,
      }];
    }),
  );
  const serializeExample = (example) => example === undefined ? null : ({
    answers: example.answers,
    resultProfile: example.result.profile,
    recommendedPlan: example.plan.plan,
    confidence: example.result.confidence,
  });
  const examplesByProfile = Object.fromEntries(
    quizProfileOrder.map((profile) => {
      const example = evaluated.find(({ result }) => result.profile === profile);
      return [profile, serializeExample(example)];
    }),
  );
  const examplesByPlan = Object.fromEntries(
    quizPlanOrder.map((plan) => {
      const example = evaluated.find((candidate) => candidate.plan.plan === plan);
      return [plan, serializeExample(example)];
    }),
  );
  const earlyPaths = [];
  for (const answer1 of choicesFor(first)) {
    for (const answer2 of choicesFor(second)) {
      for (const answer3 of choicesFor(third)) {
        const answers = [answer1, answer2, answer3];
        earlyPaths.push({
          answers,
          branch: getQuizQuestionPath(answers)[3].id,
        });
      }
    }
  }

  const outcomeSets = new Map();
  for (const { answers, result, plan } of evaluated) {
    for (const answer of answers) {
      const key = `${answer.questionId}:${answer.optionId}`;
      const current = outcomeSets.get(key) ?? { profiles: new Set(), plans: new Set() };
      current.profiles.add(result.profile);
      current.plans.add(plan.plan);
      outcomeSets.set(key, current);
    }
  }
  const influence = Object.fromEntries(
    [...outcomeSets.entries()].map(([key, value]) => [key, {
      profiles: [...value.profiles].sort(),
      plans: [...value.plans].sort(),
    }]),
  );
  const matrix = quizQuestions.map((question) => ({
    id: question.id,
    adaptive: adaptiveQuizQuestions.some((candidate) => candidate.id === question.id),
    presentation: question.presentation,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      impact: Object.fromEntries(
        quizDimensionIds.map((dimension) => [dimension, option.impact[dimension] ?? 0]),
      ),
    })),
  }));
  const invalidPaths = evaluated.filter(({ answers }) => !hasCompleteQuizAnswers(answers)).length;
  const maximumProfileShare = Math.max(...Object.values(profileDistribution)) / evaluated.length;
  const minimumProfileOutcomesPerAnswer = Math.min(
    ...Object.values(influence).map((value) => value.profiles.length),
  );
  const minimumPlanOutcomesPerAnswer = Math.min(
    ...Object.values(influence).map((value) => value.plans.length),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    quizVersion: "3.0.0",
    totalCombinations: evaluated.length,
    invalidPaths,
    profileDistribution,
    planDistribution,
    confidenceDistribution,
    branchDistribution,
    dimensionStats,
    maximumProfileShare,
    minimumProfileOutcomesPerAnswer,
    minimumPlanOutcomesPerAnswer,
    examplesByProfile,
    examplesByPlan,
    adaptiveCoverage: getAdaptiveCoverage(),
    earlyPaths,
    profiles: Object.fromEntries(
      quizProfileOrder.map((profile) => [profile, {
        title: quizProfiles[profile].title,
        center: quizProfiles[profile].center,
      }]),
    ),
    plans: Object.fromEntries(
      quizPlanOrder.map((plan) => [plan, {
        title: quizPlanDefinitions[plan].title,
        center: quizPlanDefinitions[plan].center,
      }]),
    ),
    matrix,
    influence,
  };

  const table = (record) => Object.entries(record)
    .map(([key, value]) => `| ${key} | ${value} | ${(value / evaluated.length * 100).toFixed(2)}% |`)
    .join("\n");
  const adaptiveMap = adaptiveQuizQuestions
    .map((question) => `- \`${question.id}\`: esclarece ${question.adaptiveFor.join(", ")}.`)
    .join("\n");
  const scoringMatrix = [
    `# Matriz de pontuação do quiz Belvitale v3`,
    "",
    "Pesos brutos por resposta. A normalização de 0 a 100 considera os mínimos e máximos possíveis no caminho efetivamente percorrido.",
    "",
    `| Pergunta | Tipo | Formato | Resposta | ${quizDimensionIds.join(" | ")} |`,
    `| --- | --- | --- | --- | ${quizDimensionIds.map(() => "---:").join(" | ")} |`,
    ...matrix.flatMap((question) => question.options.map((option) =>
      `| ${question.id} | ${question.adaptive ? "adaptativa" : "comum"} | ${question.presentation} | ${option.id} | ${quizDimensionIds.map((dimension) => {
        const value = option.impact[dimension];
        return value > 0 ? `+${value}` : `${value}`;
      }).join(" | ")} |`,
    )),
    "",
    "Nenhuma resposta isolada escolhe um perfil ou uma duração. O perfil usa proximidade entre o vetor normalizado e os centros; a duração usa um cálculo independente de conveniência.",
    "",
  ].join("\n");
  const adaptivePaths = [
    "# Mapa dos caminhos adaptativos do quiz Belvitale v3",
    "",
    "A quarta interação é escolhida após as três primeiras respostas. O número percebido de etapas permanece 6.",
    "",
    "## Cobertura por ramo",
    "",
    "| Ramo | Dimensões que esclarece | Jornadas completas |",
    "| --- | --- | ---: |",
    ...Object.entries(getAdaptiveCoverage()).map(([branch, dimensions]) =>
      `| ${branch} | ${dimensions.join(", ")} | ${branchDistribution[branch] ?? 0} |`,
    ),
    "",
    "## Decisão para todas as 64 combinações iniciais",
    "",
    "| first-move | planning-dose | missed-day | Ramo escolhido |",
    "| --- | --- | --- | --- |",
    ...earlyPaths.map(({ answers, branch }) =>
      `| ${answers[0].optionId} | ${answers[1].optionId} | ${answers[2].optionId} | ${branch} |`,
    ),
    "",
  ].join("\n");
  const markdown = `# Validação do quiz Belvitale v3\n\nGerado em ${report.generatedAt}.\n\n## Cobertura\n\n- Combinações completas: **${evaluated.length}**\n- Caminhos inválidos: **${invalidPaths}**\n- Maior participação de um perfil: **${(maximumProfileShare * 100).toFixed(2)}%**\n- Mínimo de perfis possíveis por resposta isolada: **${minimumProfileOutcomesPerAnswer}**\n- Mínimo de kits possíveis por resposta isolada: **${minimumPlanOutcomesPerAnswer}**\n\n## Perfis\n\n| Perfil | Combinações | Participação |\n| --- | ---: | ---: |\n${table(profileDistribution)}\n\n## Recomendações\n\n| Duração | Combinações | Participação |\n| --- | ---: | ---: |\n${table(planDistribution)}\n\n## Caminhos adaptativos\n\n${adaptiveMap}\n\n| Ramo | Combinações | Participação |\n| --- | ---: | ---: |\n${table(branchDistribution)}\n\n## Método\n\nCada resposta altera pelo menos duas das oito dimensões. As dimensões são normalizadas de 0 a 100 a partir dos mínimos e máximos possíveis no caminho efetivamente percorrido. O perfil usa distância euclidiana ponderada aos quatro centros, com Manhattan ponderada e maior diferença como critérios matemáticos secundários. A confiança usa a separação entre as duas menores distâncias e nunca é exibida como porcentagem.\n\nA recomendação de duração é calculada separadamente a partir de compromisso inicial, constância, planejamento, desejo de reduzir reposições e conveniência. Nenhuma resposta isolada determina perfil ou duração.\n`;

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDirectory, "validation.json"), JSON.stringify(report, null, 2)),
    writeFile(path.join(outputDirectory, "validation.md"), markdown),
    writeFile(path.join(outputDirectory, "scoring-matrix.md"), scoringMatrix),
    writeFile(path.join(outputDirectory, "adaptive-paths.md"), adaptivePaths),
  ]);
  process.stdout.write(JSON.stringify({
    totalCombinations: report.totalCombinations,
    profileDistribution,
    planDistribution,
    branchDistribution,
    dimensionStats,
  }, null, 2));
} finally {
  await server.close();
}
