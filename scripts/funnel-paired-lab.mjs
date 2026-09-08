// Strategic heuristic model. No respondent, probability, causal lift or sale is measured.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import process from 'node:process';
/* global console, localStorage */

const phase = process.argv[2] ?? 'before';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
const directory = 'artifacts/funnel-review';
const base = process.env.FUNNEL_BASE_URL ?? 'http://127.0.0.1:4185';
const server = await createServer({ server: { port: 4185, host: '127.0.0.1', strictPort: true }, logLevel: 'silent' });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome' });
const clamp = (n) => Math.round(Math.max(0, Math.min(100, n)) * 10) / 10;
const mean = (a) => a.length ? clamp(a.reduce((x, y) => x + y, 0) / a.length) : null;
let seed = 9082026;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(random() * a.length)];
const metrics = ['entendimento', 'identificacao', 'curiosidade', 'vontade_iniciar', 'abandono_pergunta', 'fadiga', 'progresso', 'relevancia', 'confianca', 'desconforto', 'manipulacao', 'qualidade_insights', 'continuar', 'credibilidade', 'personalizacao', 'conclusao', 'reacao_resultado', 'clique_vendas', 'retencao_vendas', 'consumo_argumentacao', 'interacao_cta', 'intencao_checkout', 'intencao_compra', 'objecoes'];
const negative = ['abandono_pergunta', 'fadiga', 'desconforto', 'manipulacao', 'objecoes'];
try {
  await mkdir(`${directory}/${phase}`, { recursive: true });
  const [{ quizQuestions }, { monjQuestions }, { buildPersonalizedInsight }, { createQuizSession }] = await Promise.all([
    server.ssrLoadModule('/src/features/quiz/content/questions.ts'), server.ssrLoadModule('/src/features/quiz-monj/quizMonjData.ts'),
    server.ssrLoadModule('/src/features/quiz/content/insights.ts'), server.ssrLoadModule('/src/features/quiz/state/quiz.storage.ts'),
  ]);
  const monjSource = await readFile('src/features/quiz-monj/QuizMonjExperience.tsx', 'utf8');
  const hasMonjAB = /getMonjExperimentAssignment/.test(monjSource);
  const personas = phase === 'after' ? JSON.parse(await readFile(`${directory}/personas.json`, 'utf8')) : Array.from({ length: 1000 }, (_, i) => {
    const audience = i < 500 ? 'MOUNJARO' : 'NORMAL';
    const age = pick(['25–34', '35–44', '45–54', '55+']);
    const lostKg = audience === 'MOUNJARO' ? pick([8, 12, 17, 24, 35]) : pick([0, 0, 0, 4]);
    const p = {
      id: `${audience}-${String(i % 500 + 1).padStart(3, '0')}`, audience, age,
      income: pick(['até 2 SM', '2–5 SM', '5+ SM']), education: pick(['fundamental', 'médio', 'superior']),
      region: pick(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']), relationship: pick(['solteira', 'em relação', 'separada']),
      children: pick([0, 1, 2, 3]), discomfort: pick([15, 40, 65, 90]), cellulite: pick([1, 2, 3]), laxity: pick([1, 2, 3]),
      lostKg, monthsSinceLoss: lostKg > 0 ? pick([1, 3, 6, 12, 24]) : null,
      lossStage: audience === 'MOUNJARO' ? pick(['em perda', 'estável recente', 'estável']) : 'não aplicável',
      strategy: audience === 'MOUNJARO' ? pick(['tirzepatida', 'tirzepatida', 'outra estratégia']) : 'sem tirzepatida',
      skepticism: pick([20, 55, 90]), supplements: pick([true, false]), procedures: pick([true, false]),
      priceSensitivity: pick([20, 55, 90]), insecurity: pick([15, 45, 80]), initialIntent: pick([15, 45, 75]),
      priorAttempts: pick([0, 1, 4, 7]), badExperience: pick([true, false]), proofPreference: pick(['ciência', 'relatos', 'composição']),
    };
    // Fixed responses reused in both variants and both revisions. Scenario coverage, not a demographic prediction.
    const questions = audience === 'NORMAL' ? quizQuestions : monjQuestions;
    p.answers = Object.fromEntries(questions.map(q => [q.id, pick(q.options).id]));
    if (audience === 'NORMAL') {
      if (p.badExperience) p.answers.history = 'disappointed';
      if (p.priceSensitivity === 90) p.answers['decision-weight'] = 'money';
      if (p.discomfort === 15) p.answers.avoidance = 'never';
    } else {
      p.answers['weight-change'] = lostKg >= 17 ? 'over-ten' : 'five-ten';
      p.answers['weight-stability'] = p.lossStage === 'em perda' ? 'still-losing' : p.lossStage === 'estável' ? 'stable-three' : 'recent-stable';
    }
    return p;
  });
  if (phase === 'before') await writeFile(`${directory}/personas.json`, JSON.stringify(personas, null, 2));

  const reuse = process.argv.includes('--reuse-snapshots');
  const snapshots = reuse ? JSON.parse(await readFile(`${directory}/${phase}/snapshots.json`, 'utf8')) : {};
  for (const audience of reuse ? [] : ['MOUNJARO', 'NORMAL']) for (const variant of ['a', 'b']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    page.on('pageerror', error => console.error(error.message));
    const route = audience === 'NORMAL' ? '/quiz' : '/quiz-monj';
    const answers = personas.find(p => p.audience === audience).answers;
    await page.goto(`${base}${route}?ab=${variant}`);
    await page.locator('.q7-opening').waitFor();
    const opening = await page.locator('.q7-opening').innerText();
    await page.screenshot({ path: `${directory}/${phase}/${audience}_${variant}-opening-390.png` });
    const insightStages = audience === 'NORMAL' ? ['insight-one', 'insight-two', 'insight-three', 'result', 'offer'] : [6, 12, 18, 20];
    const sections = [];
    for (const stage of insightStages) {
      console.log('Capturing', audience, variant, stage);
      const state = audience === 'NORMAL' ? { ...createQuizSession(), answers, stageId: stage, visitedStageIds: ['opening', stage] } : { version: 1, stageIndex: stage, answers, name: '', savedAt: Date.now() };
      await page.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: audience === 'NORMAL' ? 'belvitale.quiz.v7' : 'belvitale.quiz-monj.v1', state });
      await page.reload({ waitUntil: 'domcontentloaded' });
      const selector = stage === 'offer' ? '.q7-offer' : stage === 'result' || stage === 20 ? '.q7-result' : '.q7-insight';
      await page.locator(selector).waitFor();
      sections.push({ stage, text: await page.locator(selector).innerText() });
      if (selector === '.q7-insight') await page.screenshot({ path: `${directory}/${phase}/${audience}_${variant}-${String(stage)}-390.png`, fullPage: true });
      if (selector === '.q7-result') {
        await page.locator('.q7-result__transition').scrollIntoViewIfNeeded();
        await page.locator('.q7-result__transition img').evaluate(async img => { if (!img.complete) await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }); });
        const visual = await page.locator('.q7-result__transition img').boundingBox();
        sections.at(-1).productWidth = visual?.width ?? 0;
        sections.at(-1).productHeight = visual?.height ?? 0;
        await page.screenshot({ path: `${directory}/${phase}/${audience}_${variant}-product-390.png` });
        if (audience === 'NORMAL') {
          await page.locator('.q7-desire').scrollIntoViewIfNeeded();
          await page.locator('.q7-desire img').evaluateAll(async images => { await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }))); });
          await page.screenshot({ path: `${directory}/${phase}/${audience}_${variant}-mosaic-390.png` });
        }
      }
    }
    snapshots[`${audience}_${variant.toUpperCase()}`] = { available: audience === 'NORMAL' || variant === 'a' || hasMonjAB, opening, sections };
    await context.close();
  }
  const exposures = personas.flatMap(p => ['A', 'B'].map(variant => {
    const key = `${p.audience}_${variant}`;
    const snapshot = snapshots[key];
    const insights = p.audience === 'NORMAL' ? [1, 2, 3].map(n => buildPersonalizedInsight(n, p.answers)).map(x => `${x.title} ${x.explanation} ${x.reflection}`) : snapshot.sections.slice(0, 3).map(s => s.text);
    const text = `${snapshot.opening} ${snapshot.sections.map(s => s.text).join(' ')}`;
    const questions = p.audience === 'NORMAL' ? quizQuestions : monjQuestions;
    const features = {
      questionCount: questions.length,
      discoveryCta: variant === 'B' && snapshot.available ? 1 : 0,
      readable: Math.max(...insights.map(x => x.split(/\s+/).length)) < 145 ? 1 : 0,
      repetitiveDiscipline: /Suadificuldadepareceestarmenosligadaàdisciplina/i.test(text.replace(/\s/g, '')) ? 1 : 0,
      fakeHumanAnalysis: /observação humana/.test(text) ? 1 : 0,
      formulaVisible: /Vitamina C|vitamina C/.test(text) ? 1 : 0,
      limitsVisible: /estudo clínico|eficácia|não comprova/.test(text) ? 1 : 0,
      productPresence: (snapshot.sections.find(s => s.productHeight)?.productHeight ?? 0) >= 280 ? 1 : 0,
      numberedInsight: /Leitura [123] de 3/i.test(text) ? 1 : 0,
      otherLossSupported: p.audience === 'NORMAL' || questions[0].options.some(o => o.id === 'other-strategy') ? 1 : 0,
      answerReflection: insights.every(x => x.length > 80) ? 1 : 0,
      objectionsAnswered: /Quanto tempo|Quanto tempo preciso|Em quanto tempo/.test(text) ? 1 : 0,
    };
    // Fixed weights, identical before/after. Higher is better except negative metrics.
    const clarity = clamp(52 + 12 * features.readable + 8 * features.formulaVisible + 5 * features.objectionsAnswered);
    const identification = clamp(62 + 8 * features.answerReflection - 14 * features.repetitiveDiscipline * (p.badExperience ? 1 : .3) - (p.strategy === 'outra estratégia' ? 25 * (1 - features.otherLossSupported) : 0));
    const trust = clamp(48 + 13 * features.limitsVisible + 8 * features.formulaVisible - 12 * features.fakeHumanAnalysis - .12 * p.skepticism);
    const fatigue = clamp(questions.length * 2.1 + 10 * (1 - features.readable) + 7 * features.numberedInsight);
    const intent = clamp(.3 * p.initialIntent + .25 * trust + .2 * clarity + .15 * identification + 6 * features.productPresence - .14 * p.priceSensitivity);
    const scores = [clarity, identification, 54 + 5 * features.discoveryCta, .6 * identification + .3 * clarity + 4 * features.discoveryCta, fatigue * .65, fatigue, 74 - 4 * features.numberedInsight, identification, trust, 15 + .12 * p.insecurity + 8 * features.repetitiveDiscipline, 20 + 15 * features.fakeHumanAnalysis + 8 * features.repetitiveDiscipline, .5 * clarity + .5 * trust, 80 - .5 * fatigue, trust, 58 + 10 * features.answerReflection, 82 - .5 * fatigue, .5 * identification + .5 * trust, intent + 4, 50 + 10 * features.formulaVisible, clarity, intent + 5 * features.productPresence, intent, intent - 5, 100 - trust];
    const sectionScores = snapshot.sections.map(s => ({ stage: s.stage, identificacao: identification, clareza: clarity, curiosidade: 54, confianca: trust, credibilidade: trust, impacto_emocional: clamp(identification * .8), continuar: clamp(80 - fatigue * .5), objecoes: clamp(100 - trust), valor: intent, intencao_compra: intent - 5 }));
    return { personaId: p.id, audience: p.audience, variant, available: snapshot.available, comparisonEligible: snapshot.available && (p.audience === 'NORMAL' || hasMonjAB), features, scores: Object.fromEntries(metrics.map((m, i) => [m, clamp(scores[i])])), questions: questions.map((q, i) => ({ id: q.id, selected: p.answers[q.id], frictionIndex: clamp(12 + i * 1.8 + (p.strategy === 'outra estratégia' && i === 0 ? 30 * (1 - features.otherLossSupported) : 0)) })), sections: sectionScores, objections: [p.priceSensitivity === 90 ? 'Cabe no orçamento?' : 'Qual é o custo total?', p.badExperience ? 'Qual evidência da fórmula completa?' : 'O que posso esperar?', p.audience === 'MOUNJARO' ? 'É compatível com meu acompanhamento?' : 'Por que seria diferente do que já tentei?'] };
  }));
  const scorecards = Object.fromEntries(Object.keys(snapshots).map(key => [key, { available: snapshots[key].available, n: 500, scores: Object.fromEntries(metrics.map(m => [m, mean(exposures.filter(e => `${e.audience}_${e.variant}` === key).map(e => e.scores[m]))])) }]));
  const segments = { '25–34': p => p.age === '25–34', '35–44': p => p.age === '35–44', '45+': p => ['45–54', '55+'].includes(p.age), ceticas: p => p.skepticism === 90, alto_incomodo: p => p.discomfort >= 65, baixo_incomodo: p => p.discomfort <= 40, grande_perda: p => p.lostKg >= 17, recente: p => p.monthsSinceLoss !== null && p.monthsSinceLoss <= 3, suplementos: p => p.supplements, iniciantes: p => p.priorAttempts === 0, sensiveis_preco: p => p.priceSensitivity === 90, varias_tentativas: p => p.priorAttempts >= 4 };
  const paired = ['MOUNJARO', 'NORMAL'].map(audience => ({ audience, eligible: audience === 'NORMAL' || hasMonjAB, segments: Object.entries({ todos: () => true, ...segments }).map(([segment, predicate]) => {
    const people = personas.filter(p => p.audience === audience && predicate(p));
    const pairs = people.map(p => exposures.filter(e => e.personaId === p.id));
    return { segment, n: people.length, deltaBminusA: Object.fromEntries(metrics.map(m => [m, mean(pairs.map(([a, b]) => b.scores[m] - a.scores[m]))])) };
  }) }));
  // Deltas are signed; do not clamp negative changes as if they were scores.
  for (const report of paired) for (const segment of report.segments) {
    const predicate = segment.segment === 'todos' ? () => true : segments[segment.segment];
    const people = personas.filter(p => p.audience === report.audience && predicate(p));
    for (const m of metrics) segment.deltaBminusA[m] = people.length ? Number((people.reduce((sum, p) => { const [a, b] = exposures.filter(e => e.personaId === p.id); return sum + b.scores[m] - a.scores[m]; }, 0) / people.length).toFixed(2)) : null;
  }
  const report = { phase, modelVersion: 'heuristic-rubric-1', populationHash: createHash('sha256').update(JSON.stringify(personas)).digest('hex'), uniquePersonas: personas.length, exposures: exposures.length, negativeMetrics: negative, method: 'Fixed rubric evaluated over DOM snapshots and answer scenarios. Scores are assumption-driven indices, NEVER conversion probabilities or real consumer reactions. Demographic fields are coverage only, never causal weights. Section scores inherit journey-level indices; they are not independent section observations. No carryover/order effect is modeled. Mounjaro B before implementation is explicitly unavailable; duplicated control is a placeholder, excluded from comparison.', scorecards, paired };
  if (phase === 'after') {
    const before = JSON.parse(await readFile(`${directory}/before/report.json`, 'utf8'));
    if (before.populationHash !== report.populationHash) throw new Error('Paired population changed');
    report.beforeAfter = Object.fromEntries(Object.keys(scorecards).map(k => [k, { eligible: before.scorecards[k].available, delta: Object.fromEntries(metrics.map(m => [m, Number((scorecards[k].scores[m] - before.scorecards[k].scores[m]).toFixed(2))])) }]));
  }
  await Promise.all([writeFile(`${directory}/${phase}/report.json`, JSON.stringify(report, null, 2)), writeFile(`${directory}/${phase}/exposures.json`, JSON.stringify(exposures)), writeFile(`${directory}/${phase}/snapshots.json`, JSON.stringify(snapshots, null, 2))]);
  const md = `# Laboratório pareado — ${phase}\n\nSimulação heurística, não pesquisa. 1.000 personas únicas × duas condições = 2.000 exposições modeladas. Modelo e pesos fixos em scripts/funnel-paired-lab.mjs. Nenhuma taxa de compra ou vencedor é estimado. Mounjaro B inexistente no baseline é um placeholder não comparável.\n\n| Experiência | Existe | Clareza | Identificação | Confiança | Fadiga ↓ | Intenção heurística |\n|---|---|---|---|---|---|---|\n${Object.entries(scorecards).map(([k,v]) => `| ${k} | ${v.available} | ${v.scores.entendimento} | ${v.scores.identificacao} | ${v.scores.confianca} | ${v.scores.fadiga} | ${v.scores.intencao_compra} |`).join('\n')}\n\nOs scores refletem pesos declarados, não validam esses pesos. As 24 dimensões, segmentos, perguntas, objeções e deltas estão no JSON. Diferenças de CTA só recebem peso no início: não presumimos impacto causal em compra. Mesma população: ${report.populationHash}.\n`;
  await writeFile(`${directory}/${phase}/report.md`, md);
  console.log(md);
} finally { await browser.close(); await server.close(); }
