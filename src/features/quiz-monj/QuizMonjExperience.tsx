import { useEffect, useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { KineticText } from "../quiz/components/KineticText";
import {
  calculateMonjScores,
  monjDimensionLabels,
  monjDimensions,
  monjQuestions,
  selectedMonjLabel,
  type MonjAnswers,
  type MonjDimension,
  type MonjQuestion,
} from "./quizMonjData";
import "../quiz/quiz.css";
import "../quiz/quiz-refined.css";
import "./quiz-monj.css";

type MonjStage =
  | { readonly kind: "opening" }
  | { readonly kind: "name" }
  | { readonly kind: "question"; readonly questionIndex: number }
  | { readonly kind: "insight"; readonly sequence: 1 | 2 | 3 }
  | { readonly kind: "analysis" }
  | { readonly kind: "result" };

interface StoredMonjState {
  readonly version: 1;
  readonly stageIndex: number;
  readonly name: string;
  readonly answers: MonjAnswers;
  readonly savedAt: number;
}

const storageKey = "belvitale.quiz-monj.v1";
const storageLifetime = 24 * 60 * 60 * 1000;

const stages: readonly MonjStage[] = [
  { kind: "opening" },
  { kind: "name" },
  ...monjQuestions.slice(0, 4).map((_, questionIndex) => ({ kind: "question" as const, questionIndex })),
  { kind: "insight", sequence: 1 },
  ...monjQuestions.slice(4, 9).map((_, index) => ({ kind: "question" as const, questionIndex: index + 4 })),
  { kind: "insight", sequence: 2 },
  ...monjQuestions.slice(9).map((_, index) => ({ kind: "question" as const, questionIndex: index + 9 })),
  { kind: "insight", sequence: 3 },
  { kind: "analysis" },
  { kind: "result" },
];

function loadState(): StoredMonjState {
  const fresh: StoredMonjState = { version: 1, stageIndex: 0, name: "", answers: {}, savedAt: Date.now() };
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return fresh;
    const value = JSON.parse(raw) as Partial<StoredMonjState> | null;
    if (
      value?.version !== 1 ||
      typeof value.stageIndex !== "number" ||
      value.stageIndex < 0 ||
      value.stageIndex >= stages.length ||
      typeof value.name !== "string" ||
      typeof value.answers !== "object" ||
      typeof value.savedAt !== "number" ||
      Date.now() - value.savedAt > storageLifetime
    ) {
      localStorage.removeItem(storageKey);
      return fresh;
    }
    return value as StoredMonjState;
  } catch {
    return fresh;
  }
}

function safeName(value: string): string {
  return value.trim().replace(/[^\p{L}\p{M}' -]/gu, "").replace(/\s+/g, " ").slice(0, 24);
}

function MonjHeader({
  stageIndex,
  answered,
  onBack,
  onRestart,
}: {
  readonly stageIndex: number;
  readonly answered: number;
  readonly onBack: () => void;
  readonly onRestart: () => void;
}) {
  const progress = Math.round((answered / monjQuestions.length) * 100);
  return (
    <header className="q7-header qmon-header">
      <div className="q7-header__top">
        <button className="q7-icon-button" type="button" onClick={onBack} disabled={stageIndex === 0} aria-label="Voltar à etapa anterior">
          <span aria-hidden="true">←</span>
        </button>
        <a className="q7-brand" href="/quiz-monj" aria-label="Belvitale">
          <img src="/brand/belvitale-wordmark-quiz.png" width="1960" height="300" alt="Belvitale" />
        </a>
        <button className="q7-restart" type="button" onClick={onRestart}>Reiniciar</button>
      </div>
      <div className="q7-progress" aria-label={`${String(answered)} de ${String(monjQuestions.length)} perguntas respondidas`}>
        <div className="q7-progress__rail" aria-hidden="true"><span style={{ transform: `scaleX(${String(progress / 100)})` }} /></div>
        <span>{String(progress)}%</span>
      </div>
    </header>
  );
}

function Opening({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  const title = "Você emagreceu. Mas sua pele e sua força acompanharam essa mudança?";

  return (
    <section className="q7-opening qmon-opening" aria-labelledby="qmon-opening-title">
      <div className="q7-opening__copy">
        <p className="q7-kicker">Quiz pós-emagrecimento · tirzepatida</p>
        <h1 id="qmon-opening-title" ref={titleRef} tabIndex={-1} aria-label={title}>
          <KineticText text={title} accentFrom={3} />
        </h1>
        <p className="q7-opening__lead">
          Em cerca de 4 minutos, conecte ritmo de perda, força, alimentação, treino e histórico da pele para entender o que merece atenção agora.
        </p>
        <button className="q7-primary" type="button" onClick={onStart}><span>Começar minha análise</span><i aria-hidden="true">→</i></button>
        <div className="qmon-opening__trust">
          <span>✓ 14 perguntas objetivas</span><span>✓ resultado personalizado</span><span>✓ sem diagnóstico</span>
        </div>
        <p className="qmon-opening__disclaimer">Este quiz é educativo e não orienta dose, início ou interrupção de medicamento.</p>
      </div>
      <div className="q7-opening__visual" aria-hidden="true">
        <span className="q7-opening__orbit"><i /><i /><i /></span>
        <img src="/lifestyle/freedom-01-768.webp" width="768" height="960" alt="" fetchPriority="high" />
        <span className="qmon-opening__badge"><b>4 min</b><small>para olhar além da balança</small></span>
      </div>
    </section>
  );
}

function NameStep({ initialName, onContinue }: { readonly initialName: string; readonly onContinue: (name: string) => void }) {
  const [value, setValue] = useState(initialName);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);
  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onContinue(safeName(value));
  };
  return (
    <section className="q7-name" aria-labelledby="qmon-name-title">
      <p className="q7-step-label">Antes de olhar para os sinais</p>
      <h1 id="qmon-name-title" ref={titleRef} tabIndex={-1} aria-label="Como posso te chamar?"><KineticText text="Como posso te chamar?" accentFrom={3} /></h1>
      <p>Seu nome é opcional e fica somente neste dispositivo por até 24 horas.</p>
      <form onSubmit={submit}>
        <label htmlFor="qmon-name">Seu primeiro nome</label>
        <input id="qmon-name" value={value} onChange={(event) => setValue(event.currentTarget.value.slice(0, 24))} autoComplete="given-name" placeholder="Ex.: Marina" />
        <button className="q7-primary" type="submit"><span>Continuar</span><i aria-hidden="true">→</i></button>
        <button className="q7-text-button" type="button" onClick={() => onContinue("")}>Prefiro continuar sem informar</button>
      </form>
    </section>
  );
}

function QuestionStep({ question, selected, confirming, onSelect }: {
  readonly question: MonjQuestion;
  readonly selected: string | undefined;
  readonly confirming: boolean;
  readonly onSelect: (optionId: string) => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), [question.id]);
  return (
    <section className="q7-question" data-presentation={question.presentation} data-confirming={confirming} aria-labelledby={`qmon-${question.id}`}>
      <header className="q7-question__header">
        <div className="q7-question__meta"><p>{question.block}</p><span>{question.eyebrow}</span></div>
        <h1 id={`qmon-${question.id}`} ref={titleRef} tabIndex={-1} aria-label={question.prompt}><KineticText text={question.prompt} /></h1>
        {question.hint === undefined ? null : <p className="q7-question__hint">{question.hint}</p>}
      </header>
      <div className="q7-choices" role="group" aria-label="Opções de resposta" aria-busy={confirming}>
        {question.options.map((item, index) => {
          const isSelected = selected === item.id;
          return (
            <button
              className="q7-choice"
              type="button"
              key={item.id}
              data-selected={isSelected}
              data-subdued={confirming && !isSelected}
              aria-pressed={isSelected}
              disabled={confirming}
              style={{ "--q7-choice": index } as CSSProperties}
              onClick={() => onSelect(item.id)}
            >
              <span className="q7-choice__index" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span className="q7-choice__copy"><strong>{item.label}</strong>{item.detail === undefined ? null : <small>{item.detail}</small>}</span>
              <span className="q7-choice__state" aria-hidden="true"><i>{isSelected ? "✓" : "→"}</i></span>
            </button>
          );
        })}
      </div>
      {confirming ? <div className="q7-answer-confirmation" role="status"><span aria-hidden="true">✓</span><p><b>Entendi.</b> Essa resposta entrou na sua leitura.</p><i aria-hidden="true" /></div> : null}
    </section>
  );
}

function insightContent(sequence: 1 | 2 | 3, answers: MonjAnswers) {
  if (sequence === 1) return {
    eyebrow: "Primeira leitura",
    title: "Perder peso e mudar a composição do corpo não são a mesma coisa.",
    reflection: `${selectedMonjLabel(answers, "loss-pace")} ${selectedMonjLabel(answers, "first-change")}`,
    explanation: "Em estudos com tirzepatida, a maior parte do peso perdido foi gordura, mas também houve redução de massa magra. Isso não significa que toda massa magra perdida seja músculo: a medida inclui água e outros tecidos não gordurosos.",
    signals: [selectedMonjLabel(answers, "weight-change"), selectedMonjLabel(answers, "loss-pace"), selectedMonjLabel(answers, "first-change")],
    note: "A balança não mede força, função nem composição corporal sozinha.",
    cta: "Olhar para força e alimentação",
  };
  if (sequence === 2) return {
    eyebrow: "Segunda leitura",
    title: "A pergunta mais útil agora talvez não seja “quanto perdi?”, mas “o que preservei?”.",
    reflection: `${selectedMonjLabel(answers, "strength-change")} ${selectedMonjLabel(answers, "resistance-training")}`,
    explanation: "Treino resistido, ingestão alimentar possível e acompanhamento profissional ajudam a construir uma estratégia de preservação muscular. O quiz identifica pontos de conversa; não prescreve quantidade de proteína nem exercício.",
    signals: [selectedMonjLabel(answers, "strength-change"), selectedMonjLabel(answers, "resistance-training"), selectedMonjLabel(answers, "protein-pattern")],
    note: answers["intake-barrier"] === "vomiting" ? "Vômitos repetidos ou dificuldade para manter líquidos merecem contato com o profissional que acompanha seu tratamento." : "Força e capacidade nas tarefas diárias são sinais tão importantes quanto o espelho.",
    cta: "Conectar com a história da pele",
  };
  return {
    eyebrow: "Terceira leitura",
    title: "Celulite mais visível não significa, necessariamente, que surgiu mais celulite.",
    reflection: `${selectedMonjLabel(answers, "body-area")} ${selectedMonjLabel(answers, "skin-history")}`,
    explanation: "Quando o volume sob a pele diminui e existe frouxidão, o relevo pode ganhar contraste. Celulite é diferente de gordura, e emagrecer pode reduzi-la em algumas pessoas ou deixá-la mais aparente em outras.",
    signals: [selectedMonjLabel(answers, "body-area"), selectedMonjLabel(answers, "skin-history"), selectedMonjLabel(answers, "weight-stability")],
    note: "Seu resultado separa aparência, função e suporte clínico para evitar uma conclusão simplista.",
    cta: "Ver minha análise completa",
  };
}

function InsightStep({ sequence, answers, onContinue }: { readonly sequence: 1 | 2 | 3; readonly answers: MonjAnswers; readonly onContinue: () => void }) {
  const content = insightContent(sequence, answers);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), [sequence]);
  return (
    <section className="q7-insight qmon-insight" data-sequence={sequence} data-has-visual="false" aria-labelledby={`qmon-insight-${String(sequence)}`}>
      <div className="q7-insight__count" aria-hidden="true"><span><i /><i /><i /></span><b>Leitura em movimento</b></div>
      <div className="q7-insight__copy">
        <p className="q7-step-label">{content.eyebrow}</p>
        <h1 id={`qmon-insight-${String(sequence)}`} ref={titleRef} tabIndex={-1} aria-label={content.title}><KineticText text={content.title} /></h1>
        <blockquote className="q7-insight__reflection"><span>Você acabou de nos contar</span><p>{content.reflection}</p></blockquote>
        <p className="q7-insight__explanation">{content.explanation}</p>
        <div className="q7-insight__pattern">
          <div><span>Sinais conectados</span><b>sem diagnóstico</b></div>
          <ol className="q7-insight__signals">
            {content.signals.map((signal, index) => <li key={`${signal}-${String(index)}`}><small aria-hidden="true">✓</small><span>{signal}</span></li>)}
          </ol>
        </div>
        <aside className="q7-insight__note"><span aria-hidden="true">✦</span><p>{content.note}</p></aside>
      </div>
      <button className="q7-primary q7-insight__cta" type="button" onClick={onContinue}><span>{content.cta}</span><i aria-hidden="true">→</i></button>
    </section>
  );
}

function AnalysisStep() {
  const [completed, setCompleted] = useState(0);
  useEffect(() => {
    const timers = [0, 1, 2].map((index) => window.setTimeout(() => setCompleted(index + 1), 280 + index * 430));
    return () => timers.forEach(window.clearTimeout);
  }, []);
  const items = ["Separando aparência de função", "Cruzando ritmo, treino e alimentação", "Priorizando seu próximo passo"];
  return (
    <section className="q7-analysis" aria-labelledby="qmon-analysis-title" role="status">
      <div className="q7-analysis__orb" aria-hidden="true"><span /><i /></div>
      <div className="q7-analysis__copy">
        <p className="q7-step-label">Sua leitura está tomando forma</p>
        <h1 id="qmon-analysis-title">Organizando os sinais que você percebeu.</h1>
        <p>O resultado não diagnostica perda muscular, flacidez ou qualquer condição clínica.</p>
        <ol>{items.map((item, index) => <li key={item} data-complete={index < completed} data-active={index === completed}><span>{index < completed ? "✓" : String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
      </div>
    </section>
  );
}

const profileContent: Readonly<Record<MonjDimension, { readonly kicker: string; readonly title: string; readonly explanation: string }>> = {
  leanProtection: {
    kicker: "Prioridade: força e massa magra",
    title: "Seu corpo pede uma estratégia que olhe além do número na balança.",
    explanation: "Suas respostas concentram sinais em força, treino ou alimentação. Isso não confirma perda muscular, mas torna esse o melhor ponto para aprofundar com avaliação profissional.",
  },
  skinAdaptation: {
    kicker: "Prioridade: adaptação da pele",
    title: "A mudança de volume parece ter acontecido mais rápido do que a sua percepção da pele conseguiu acompanhar.",
    explanation: "Magnitude da perda, ritmo e histórico de mudanças corporais podem alterar como a pele repousa sobre o novo contorno. O aspecto pode continuar mudando após a estabilização do peso.",
  },
  celluliteContrast: {
    kicker: "Prioridade: contraste da celulite",
    title: "O que ficou mais visível pode ser o relevo — não necessariamente uma “nova” celulite.",
    explanation: "A redução do volume e a presença de pele mais solta podem aumentar o contraste dos relevos. Celulite não é simplesmente excesso de gordura e exige expectativas específicas.",
  },
  clinicalSupport: {
    kicker: "Prioridade: acompanhamento",
    title: "Antes de pensar só na estética, vale organizar os sinais com quem acompanha seu tratamento.",
    explanation: "Algumas respostas indicam barreiras alimentares, cansaço, fraqueza ou pouco acompanhamento. O passo mais seguro é revisar isso com o profissional responsável pela sua tirzepatida.",
  },
};

function ResultStep({ name, answers }: { readonly name: string; readonly answers: MonjAnswers }) {
  const scores = calculateMonjScores(answers);
  const urgent = answers["intake-barrier"] === "vomiting" || answers["strength-change"] === "limiting" || answers.recovery === "exhausted";
  const highest = monjDimensions.reduce((best, item) => scores[item] > scores[best] ? item : best, "leanProtection");
  const firstChangePriority: Readonly<Partial<Record<string, MonjDimension>>> = {
    "loose-skin": "skinAdaptation",
    cellulite: "celluliteContrast",
    "less-tone": "leanProtection",
  };
  const priority: MonjDimension = urgent || scores.clinicalSupport >= 60
    ? "clinicalSupport"
    : firstChangePriority[answers["first-change"] ?? ""] ?? highest;
  const profile = profileContent[priority];
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);

  const observations = [
    `Mudança corporal: ${selectedMonjLabel(answers, "weight-change")} ${selectedMonjLabel(answers, "loss-pace")}`,
    `Força e estímulo: ${selectedMonjLabel(answers, "strength-change")} ${selectedMonjLabel(answers, "resistance-training")}`,
    `Pele e contorno: ${selectedMonjLabel(answers, "first-change")} ${selectedMonjLabel(answers, "body-area")}`,
  ];

  return (
    <article className="q7-result qmon-result" aria-labelledby="qmon-result-title">
      <header className="q7-result__hero">
        <p className="q7-step-label">{name.length > 0 ? `Sua leitura, ${name}` : "Sua leitura personalizada"}</p>
        <h1 id="qmon-result-title" ref={titleRef} tabIndex={-1} aria-label={profile.title}><KineticText text={profile.title} accentFrom={7} /></h1>
        <p>{profile.explanation}</p>
        <span className="qmon-result__priority">{profile.kicker}</span>
      </header>

      {urgent ? <aside className="qmon-alert" role="note"><b>Um sinal merece prioridade.</b><p>Fraqueza limitante, exaustão importante ou dificuldade para manter líquidos não deve ser tratada apenas como questão estética. Entre em contato com o profissional que acompanha sua medicação.</p></aside> : null}

      <section className="qmon-scoreboard" aria-labelledby="qmon-score-title">
        <div><p className="q7-step-label">Mapa de atenção</p><h2 id="qmon-score-title">Onde suas respostas se concentraram</h2><p>Percentuais indicam prioridade relativa dentro deste quiz — não risco médico nem diagnóstico.</p></div>
        <div className="qmon-scoreboard__items">
          {monjDimensions.map((dimension) => (
            <div className="qmon-score" key={dimension} data-primary={dimension === priority}>
              <span><b>{monjDimensionLabels[dimension]}</b><strong>{String(scores[dimension])}%</strong></span>
              <i aria-hidden="true"><span style={{ "--qmon-score": scores[dimension] / 100 } as CSSProperties} /></i>
            </div>
          ))}
        </div>
      </section>

      <section className="q7-result__observations">
        <div><p className="q7-step-label">O que conectamos</p><h2>Seu resultado veio deste conjunto — não de uma resposta isolada.</h2></div>
        <ul>{observations.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="qmon-plan" aria-labelledby="qmon-plan-title">
        <p className="q7-step-label">Roteiro de conversa</p>
        <h2 id="qmon-plan-title">Três próximos passos sem mexer na sua medicação por conta própria.</h2>
        <ol>
          <li><span>01</span><div><b>Leve sinais, não só quilos.</b><p>Converse sobre força, energia, sintomas gastrointestinais e velocidade da perda com o prescritor.</p></div></li>
          <li><span>02</span><div><b>Individualize alimentação e proteína.</b><p>Um nutricionista pode adaptar refeições à saciedade, tolerância, condições clínicas e objetivos — sem fórmula universal.</p></div></li>
          <li><span>03</span><div><b>Inclua estímulo de força compatível.</b><p>Se estiver liberada para treinar, peça uma progressão adequada ao seu nível e acompanhe capacidade funcional.</p></div></li>
        </ol>
      </section>

      <section className="qmon-evidence" aria-labelledby="qmon-evidence-title">
        <div><p className="q7-step-label">Base técnica</p><h2 id="qmon-evidence-title">O que sabemos — e o que não devemos exagerar.</h2></div>
        <div className="qmon-evidence__facts">
          <article><b>74% / 26%</b><p>No subestudo DXA do SURMOUNT‑1, aproximadamente 74% do peso perdido foi gordura e 26% massa magra, em média.</p></article>
          <article><b>Massa magra ≠ músculo</b><p>A medida de massa magra inclui tecidos não gordurosos e água; não confirma, sozinha, perda de músculo esquelético.</p></article>
          <article><b>Celulite ≠ gordura</b><p>Emagrecer pode suavizar a aparência em algumas pessoas; se houver pele frouxa, os relevos também podem ficar mais aparentes.</p></article>
        </div>
        <p className="qmon-evidence__sources">Fontes: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/" target="_blank" rel="noreferrer">subestudo de composição corporal SURMOUNT‑1</a> e <a href="https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works" target="_blank" rel="noreferrer">American Academy of Dermatology</a>.</p>
      </section>

      <section className="q7-result__transition qmon-transition">
        <img src="/product/celuclin-angle.webp" width="640" height="853" alt="Frasco CeluClin" loading="lazy" decoding="async" />
        <div>
          <p className="q7-step-label">Cuidado complementar</p>
          <h2>Quer conhecer o CeluClin com composição, uso e avisos à vista?</h2>
          <p>CeluClin é suplemento alimentar, não trata efeitos da tirzepatida e não substitui alimentação, treino ou acompanhamento médico.</p>
          <a className="q7-primary" href="/#composicao"><span>Ver composição e avisos</span><i aria-hidden="true">→</i></a>
        </div>
      </section>
    </article>
  );
}

function MonjFooter() {
  return (
    <footer className="q7-footer">
      <a href="/" aria-label="Belvitale — página inicial"><img src="/brand/belvitale-monogram-black-transparent.png" width="1005" height="1005" alt="" /><span><b>Belvitale</b><small>Cuidado que cabe na vida real.</small></span></a>
      <p>Conteúdo educativo. Mounjaro é medicamento sujeito a prescrição; este quiz não possui vínculo com o fabricante e não substitui orientação profissional.</p>
    </footer>
  );
}

export function QuizMonjExperience() {
  const [initial] = useState(() => loadState());
  const [stageIndex, setStageIndex] = useState(initial.stageIndex);
  const [name, setName] = useState(initial.name);
  const [answers, setAnswers] = useState<MonjAnswers>(initial.answers);
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);
  const stage = useMemo<MonjStage>(() => stages[stageIndex] ?? { kind: "opening" }, [stageIndex]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, stageIndex, name, answers, savedAt: Date.now() } satisfies StoredMonjState)); } catch { /* segue em memória */ }
    const path = stage.kind === "result" ? "/quiz-monj/resultado" : "/quiz-monj";
    if (window.location.pathname.replace(/\/$/, "") !== path) window.history.replaceState({}, "", path + window.location.search);
  }, [answers, name, stage, stageIndex]);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (stage.kind !== "analysis") return;
    timerRef.current = window.setTimeout(() => setStageIndex((value) => Math.min(value + 1, stages.length - 1)), 1850);
    return () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); };
  }, [stage]);

  const go = (next: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setConfirming(false);
    setStageIndex(Math.max(0, Math.min(next, stages.length - 1)));
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const restart = () => {
    if (!window.confirm("Reiniciar o quiz e apagar as respostas deste dispositivo?")) return;
    try { localStorage.removeItem(storageKey); } catch { /* segue em memória */ }
    setName("");
    setAnswers({});
    go(0);
  };

  const content = (() => {
    if (stage.kind === "opening") return <Opening onStart={() => go(1)} />;
    if (stage.kind === "name") return <NameStep initialName={name} onContinue={(nextName) => { setName(nextName); go(2); }} />;
    if (stage.kind === "question") {
      const question = monjQuestions[stage.questionIndex];
      if (question === undefined) return <div className="q7-loading" role="status">Preparando esta pergunta…</div>;
      return <QuestionStep question={question} selected={answers[question.id]} confirming={confirming} onSelect={(optionId) => {
        if (confirming) return;
        setAnswers((current) => ({ ...current, [question.id]: optionId }));
        setConfirming(true);
        timerRef.current = window.setTimeout(() => go(stageIndex + 1), 430);
      }} />;
    }
    if (stage.kind === "insight") return <InsightStep sequence={stage.sequence} answers={answers} onContinue={() => go(stageIndex + 1)} />;
    if (stage.kind === "analysis") return <AnalysisStep />;
    return <ResultStep name={name} answers={answers} />;
  })();

  return (
    <div className="quiz-route q7 qmon" data-version="1.0.0">
      <a className="q7-skip" href="#conteudo-quiz-monj">Ir para o conteúdo do quiz</a>
      <MonjHeader stageIndex={stageIndex} answered={Object.keys(answers).length} onBack={() => go(stageIndex - 1)} onRestart={restart} />
      <main id="conteudo-quiz-monj" className="q7-stage" data-phase="active" data-stage={stage.kind}>
        <div className="q7-stage__track"><div key={`${stage.kind}-${String(stageIndex)}`}>{content}</div></div>
      </main>
      <MonjFooter />
    </div>
  );
}
