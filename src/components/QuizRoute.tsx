import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { canonicalUrl } from "../config/site";
import { campaignAssets, canRenderCampaignAsset } from "../data/campaignAssets";
import { getQuizAccessMode } from "../data/quizPublication";
import {
  quizPublicationApproved,
  quizPreviewEnabled,
  quizPublicationStatus,
} from "../data/quizPublicationConfig";
import { quizTotalSteps, type QuizAnswer } from "../data/quizQuestions";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { getQuizQuestionPath, sanitizeAnswersForPath } from "../quiz/quizAdaptive";
import { recordQuizEvent, getQuizAttribution } from "../quiz/quizEvents";
import { getStableQuizExperiment } from "../quiz/quizExperiment";
import {
  deriveQuizMicroInsight,
  type QuizCheckpoint,
  type QuizMicroInsight,
} from "../quiz/quizInsights";
import { calculateRecommendedPlan } from "../quiz/quizRecommendation";
import {
  getQuizRoutePath,
  getQuizUrl,
  type QuizRoutePath,
} from "../quiz/quizRouting";
import { calculateQuizResult, hasCompleteQuizAnswers } from "../quiz/quizScoring";
import {
  clearQuizState,
  createInitialQuizState,
  loadQuizState,
  saveQuizState,
  type QuizStoredState,
} from "../quiz/quizStorage";
import {
  QuizMicroInsightToast,
  QuizQuestionExperience,
} from "./quiz/QuizQuestionExperience";
import { QuizResultExperience } from "./quiz/QuizResultExperience";
import "../quiz/quiz.css";

const privacyNotice =
  "Sem diagnóstico e sem dados pessoais. Suas escolhas ficam neste dispositivo por até 30 dias para você poder continuar depois.";

function buildQuizUrl(path: QuizRoutePath): string {
  const attribution = getQuizAttribution();
  const search = new URLSearchParams();
  Object.entries(attribution).forEach(([name, value]) => {
    if (name.startsWith("utm_") && typeof value === "string") {
      search.set(name, value);
    }
  });
  const query = search.toString();
  return `${getQuizUrl(path)}${query.length === 0 ? "" : `?${query}`}`;
}

function QuizMetadata({ path }: { readonly path: QuizRoutePath }) {
  useEffect(() => {
    const isResult = path === "result";
    document.title = isResult
      ? "Seu ritmo de autocuidado | Belvitale"
      : "Descubra seu ritmo de autocuidado | Belvitale";

    const descriptionText = isResult
      ? "Uma leitura de preferências de rotina, com orientação prática e opções do CeluClin por conveniência — sem diagnóstico."
      : "Seis escolhas rápidas para descobrir o ritmo de autocuidado que combina mais com sua vida.";
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description === null) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = descriptionText;

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots === null) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = quizPublicationApproved
      ? isResult
        ? "noindex, follow"
        : "index, follow"
      : "noindex, nofollow";

    const currentCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!quizPublicationApproved || canonicalUrl === null) {
      currentCanonical?.remove();
    } else {
      const canonical = currentCanonical ?? document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = new URL(getQuizUrl("quiz"), canonicalUrl).toString();
      if (currentCanonical === null) document.head.append(canonical);
    }

    document
      .querySelectorAll<HTMLMetaElement>('meta[property^="og:"]')
      .forEach((meta) => meta.remove());
    if (quizPublicationApproved && canonicalUrl !== null) {
      const values = {
        "og:title": "Seu jeito de começar muda o que você consegue manter | Belvitale",
        "og:description": "Seis escolhas rápidas sobre começo, retomada e vida real.",
        "og:type": "website",
        "og:url": new URL(getQuizUrl("quiz"), canonicalUrl).toString(),
      };
      Object.entries(values).forEach(([property, content]) => {
        const meta = document.createElement("meta");
        meta.setAttribute("property", property);
        meta.content = content;
        document.head.append(meta);
      });
    }

    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((schema) => schema.remove());
  }, [path]);
  return null;
}

function QuizBrand() {
  return (
    <header className="quiz-header">
      <div className="quiz-header__inner">
        <a className="quiz-brand" href="/" aria-label="Belvitale — início">
          <img
            src="/brand/belvitale-wordmark-dark.webp"
            width="496"
            height="369"
            alt=""
            decoding="async"
          />
        </a>
        <span>CeluClin · 6 escolhas</span>
      </div>
    </header>
  );
}

function QuizPrivacyNotice() {
  return <p className="quiz-privacy">{privacyNotice}</p>;
}

function QuizStart({
  onStart,
  hasSavedAnswers,
}: {
  readonly onStart: () => void;
  readonly hasSavedAnswers: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const experiment = getStableQuizExperiment();
  const product = campaignAssets.productFrontPrimary;
  const canShowProduct = canRenderCampaignAsset(product);

  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const title =
    experiment.opening === "routine"
      ? "O que faz um cuidado encontrar lugar no seu dia?"
      : "Seu jeito de começar muda o que você consegue manter.";

  return (
    <main className="quiz-main quiz-main--start" id="conteudo-quiz">
      <div className="quiz-start">
        <div className="quiz-start__visual">
          <div className="quiz-start__band" aria-hidden="true">
            <span>começar</span><span>voltar</span><span>manter</span>
          </div>
          {canShowProduct ? (
            <picture>
              <source media="(max-width: 47.99rem)" srcSet={product.mobileSrc} type="image/webp" />
              <img
                src={product.src}
                width={product.width}
                height={product.height}
                alt="Frasco CeluClin em vista frontal."
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          ) : null}
          <p aria-hidden="true">60–90 s</p>
        </div>

        <div className="quiz-start__copy">
          <p className="quiz-kicker">Uma conversa visual sobre rotina</p>
          <h1 ref={titleRef} tabIndex={-1}>{title}</h1>
          <p className="quiz-start__lead">
            Faça seis escolhas rápidas e descubra um ritmo de autocuidado que
            combina mais com a sua vida.
          </p>
          <button className="quiz-primary-action" type="button" onClick={onStart}>
            {hasSavedAnswers ? "Continuar meu ritmo" : "Descobrir meu ritmo"}
          </button>
          <div className="quiz-start__meta">
            <span>60–90 segundos</span>
            <span>Ao final: uma orientação de rotina e uma opção do CeluClin por conveniência.</span>
          </div>
          <QuizPrivacyNotice />
        </div>
      </div>
    </main>
  );
}

function QuizInvalidResult({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-state-message">
        <p className="quiz-kicker">Resultado ainda não formado</p>
        <h1 ref={titleRef} tabIndex={-1}>Seu ritmo precisa das seis escolhas.</h1>
        <p>
          Nenhum perfil é criado sem um caminho completo e válido. Você pode
          recomeçar agora — sem cadastro e sem avaliação corporal.
        </p>
        <button className="quiz-primary-action" type="button" onClick={onStart}>
          Começar o quiz
        </button>
      </div>
    </main>
  );
}

function QuizUnavailable() {
  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-state-message">
        <p className="quiz-kicker">Belvitale · CeluClin</p>
        <h1 tabIndex={-1}>Essa experiência não está disponível agora.</h1>
        <p>
          A publicação depende dos gates de conteúdo, regulação, privacidade e
          checkout. Você ainda pode consultar as informações confirmadas do produto.
        </p>
        <a className="quiz-primary-action" href="/#celuclin">Conhecer o CeluClin</a>
      </div>
    </main>
  );
}

function upsertAnswer(
  answers: readonly QuizAnswer[],
  questionId: string,
  optionId: string,
): readonly QuizAnswer[] {
  return [
    ...answers.filter((answer) => answer.questionId !== questionId),
    { questionId, optionId },
  ];
}

export function QuizRoute() {
  const initialRoute = getQuizRoutePath(window.location.pathname) ?? "quiz";
  const [route, setRoute] = useState<QuizRoutePath>(initialRoute);
  const [quizState, setQuizState] = useState<QuizStoredState>(loadQuizState);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [activeInsight, setActiveInsight] = useState<QuizMicroInsight | null>(null);
  const reducedMotion = useReducedMotion();
  const experiment = getStableQuizExperiment();
  const transitionTimer = useRef<number | null>(null);
  const insightTimer = useRef<number | null>(null);
  const stateRef = useRef(quizState);
  const viewRecorded = useRef(false);
  const abandonRecorded = useRef(false);
  const questionViews = useRef(new Set<string>());
  const path = useMemo(
    () => getQuizQuestionPath(quizState.answers),
    [quizState.answers],
  );
  const currentQuestion = path[quizState.currentStep];
  const selectedOptionId =
    currentQuestion === undefined
      ? null
      : quizState.answers.find(
          (answer) => answer.questionId === currentQuestion.id,
        )?.optionId ?? null;
  const accessMode = getQuizAccessMode(
    quizPublicationStatus,
    import.meta.env.DEV,
    import.meta.env.VITE_INTERNAL_QUIZ === "true" || quizPreviewEnabled,
  );

  function persistState(nextState: QuizStoredState) {
    stateRef.current = nextState;
    setQuizState(nextState);
    saveQuizState(nextState);
  }

  function navigate(nextRoute: QuizRoutePath, replace = false) {
    window.history[replace ? "replaceState" : "pushState"](
      null,
      "",
      buildQuizUrl(nextRoute),
    );
    setRoute(nextRoute);
  }

  function clearTimers() {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    if (insightTimer.current !== null) window.clearTimeout(insightTimer.current);
    transitionTimer.current = null;
    insightTimer.current = null;
  }

  useEffect(() => clearTimers, []);

  useEffect(() => {
    function handlePopState() {
      setRoute(getQuizRoutePath(window.location.pathname) ?? "quiz");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (accessMode !== "interactive" || viewRecorded.current) return;
    viewRecorded.current = true;
    recordQuizEvent("quiz_view");
  }, [accessMode]);

  useEffect(() => {
    if (currentQuestion === undefined || quizState.currentStep < 0) return;
    const viewKey = `${String(quizState.currentStep)}:${currentQuestion.id}`;
    if (questionViews.current.has(viewKey)) return;
    questionViews.current.add(viewKey);
    recordQuizEvent("quiz_question_view", {
      question_id: currentQuestion.id,
      step: quizState.currentStep + 1,
    });
  }, [currentQuestion, quizState.currentStep]);

  useEffect(() => {
    function recordAbandon() {
      const state = stateRef.current;
      if (
        abandonRecorded.current ||
        state.currentStep < 0 ||
        state.currentStep >= quizTotalSteps
      ) {
        return;
      }
      abandonRecorded.current = true;
      const currentPath = getQuizQuestionPath(state.answers);
      const question = currentPath[state.currentStep];
      recordQuizEvent("quiz_abandon", {
        ...(question === undefined ? {} : { question_id: question.id }),
        step: state.currentStep + 1,
      });
    }
    window.addEventListener("pagehide", recordAbandon);
    return () => window.removeEventListener("pagehide", recordAbandon);
  }, []);

  function startQuiz() {
    clearTimers();
    setActiveInsight(null);
    setDirection("forward");
    abandonRecorded.current = false;
    const answers = quizState.profile === undefined ? quizState.answers : [];
    const now = new Date().toISOString();
    persistState({
      answers,
      currentStep: 0,
      startedAt: quizState.profile === undefined ? quizState.startedAt ?? now : now,
    });
    recordQuizEvent("quiz_start");
    if (route !== "quiz") navigate("quiz", true);
  }

  function startFromInvalidResult() {
    clearQuizState();
    setQuizState(createInitialQuizState());
    stateRef.current = createInitialQuizState();
    navigate("quiz", true);
    window.setTimeout(startQuiz, 0);
  }

  function showInsight(checkpoint: QuizCheckpoint, answers: readonly QuizAnswer[]) {
    const insight = deriveQuizMicroInsight(checkpoint, answers);
    setActiveInsight(insight);
    recordQuizEvent("quiz_checkpoint_view", {
      step: checkpoint === "after-planning" ? experiment.firstCheckpointAfter : 4,
    });
    if (insightTimer.current !== null) window.clearTimeout(insightTimer.current);
    insightTimer.current = window.setTimeout(() => {
      setActiveInsight(null);
      insightTimer.current = null;
    }, reducedMotion ? 700 : 1200);
  }

  function finishQuiz(answers: readonly QuizAnswer[]) {
    if (!hasCompleteQuizAnswers(answers)) return;
    const calculation = calculateQuizResult(answers);
    const plan = calculateRecommendedPlan(calculation.dimensions).plan;
    const completedState: QuizStoredState = {
      answers,
      currentStep: quizTotalSteps,
      startedAt: quizState.startedAt ?? new Date().toISOString(),
      profile: calculation.profile,
      completedAt: new Date().toISOString(),
    };
    persistState(completedState);
    recordQuizEvent("quiz_complete", {
      result_profile: calculation.profile,
      recommended_plan: plan,
    });
    navigate("result");
  }

  function advanceAfterSelection(
    step: number,
    answers: readonly QuizAnswer[],
  ) {
    if (step === quizTotalSteps - 1) {
      finishQuiz(answers);
      return;
    }

    persistState({
      answers,
      currentStep: step + 1,
      startedAt: quizState.startedAt ?? new Date().toISOString(),
    });
    const answeredCount = step + 1;
    if (answeredCount === experiment.firstCheckpointAfter) {
      showInsight("after-planning", answers);
    } else if (answeredCount === 4) {
      showInsight("after-adaptive", answers);
    }
  }

  function selectOption(optionId: string) {
    if (currentQuestion === undefined) return;
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    setDirection("forward");
    const withAnswer = upsertAnswer(
      quizState.answers,
      currentQuestion.id,
      optionId,
    );
    const nextAnswers =
      quizState.currentStep <= 2
        ? sanitizeAnswersForPath(withAnswer)
        : withAnswer;
    persistState({
      answers: nextAnswers,
      currentStep: quizState.currentStep,
      startedAt: quizState.startedAt ?? new Date().toISOString(),
    });
    recordQuizEvent("quiz_answer", {
      question_id: currentQuestion.id,
      answer_id: optionId,
      step: quizState.currentStep + 1,
    });

    const answeredStep = quizState.currentStep;
    transitionTimer.current = window.setTimeout(() => {
      transitionTimer.current = null;
      advanceAfterSelection(answeredStep, nextAnswers);
    }, reducedMotion ? 30 : 320);
  }

  function goBack() {
    clearTimers();
    setActiveInsight(null);
    setDirection("backward");
    const nextStep = Math.max(-1, quizState.currentStep - 1);
    recordQuizEvent("quiz_back", {
      ...(currentQuestion === undefined ? {} : { question_id: currentQuestion.id }),
      ...(quizState.currentStep < 0 ? {} : { step: quizState.currentStep + 1 }),
    });
    persistState({
      answers: quizState.answers,
      currentStep: nextStep,
      ...(quizState.startedAt === undefined ? {} : { startedAt: quizState.startedAt }),
    });
  }

  function restartQuiz() {
    clearTimers();
    clearQuizState();
    const initial = createInitialQuizState();
    stateRef.current = initial;
    setQuizState(initial);
    setDirection("backward");
    setActiveInsight(null);
    recordQuizEvent("quiz_restart", {
      ...(quizState.profile === undefined ? {} : { result_profile: quizState.profile }),
    });
    navigate("quiz");
  }

  const completedCalculation =
    quizState.profile !== undefined && hasCompleteQuizAnswers(quizState.answers)
      ? calculateQuizResult(quizState.answers)
      : null;

  return (
    <div
      className="quiz-route"
      data-publication-status={quizPublicationStatus}
      data-route={route}
      data-experiment={experiment.id}
    >
      <QuizMetadata path={route} />
      <a className="skip-link" href="#conteudo-quiz">Ir para o conteúdo</a>
      <QuizBrand />
      <QuizMicroInsightToast insight={activeInsight} />
      {accessMode === "unavailable" ? (
        <QuizUnavailable />
      ) : route === "result" && completedCalculation !== null ? (
        <QuizResultExperience
          calculation={completedCalculation}
          onRestart={restartQuiz}
        />
      ) : route === "result" ? (
        <QuizInvalidResult onStart={startFromInvalidResult} />
      ) : quizState.currentStep < 0 || currentQuestion === undefined ? (
        <QuizStart
          onStart={startQuiz}
          hasSavedAnswers={quizState.answers.length > 0 && quizState.profile === undefined}
        />
      ) : (
        <QuizQuestionExperience
          question={currentQuestion}
          step={quizState.currentStep}
          total={quizTotalSteps}
          selectedOptionId={selectedOptionId}
          direction={direction}
          onBack={goBack}
          onSelect={selectOption}
        />
      )}
    </div>
  );
}
