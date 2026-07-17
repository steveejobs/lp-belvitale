import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { getQuizAccessMode } from "../../../data/quizPublication";
import {
  quizPublicationApproved,
  quizPreviewEnabled,
  quizPublicationStatus,
} from "../../../data/quizPublicationConfig";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { getQuizRoutePath, getQuizUrl, type QuizRoutePath } from "../../../quiz/quizRouting";
import { recordQuizEvent } from "../analytics/quiz.events";
import { deriveProofInsight, deriveStartInsight } from "../content/interstitials";
import { quizQuestions, quizQuestionMap } from "../content/questions";
import { calculateRecommendedPlan } from "../domain/quiz.recommendation";
import { calculateQuizResult } from "../domain/quiz.scoring";
import {
  quizQuestionIds,
  quizSceneIds,
  type QuizPlanId,
  type QuizQuestionId,
} from "../domain/quiz.types";
import { hasCompleteQuizAnswers } from "../domain/quiz.validation";
import { useQuizSceneTransition } from "../motion/useQuizSceneTransition";
import {
  getAnsweredCount,
  quizMachineReducer,
} from "../state/quiz-machine";
import {
  clearQuizState,
  loadQuizState,
  saveQuizState,
} from "../state/quiz-storage";
import { InsightReveal } from "./InsightReveal";
import { OfferRecommendation } from "./OfferRecommendation";
import { ProofMoment } from "./ProofMoment";
import { QuestionStage } from "./QuestionStage";
import { QuizIntro } from "./QuizIntro";
import { QuizShell } from "./QuizShell";
import { ResultAnticipation } from "./ResultAnticipation";
import { ResultReveal } from "./ResultReveal";
import { StoryInterstitial } from "./StoryInterstitial";
import "../quiz.css";

function now(): string {
  return new Date().toISOString();
}

function buildRouteUrl(route: QuizRoutePath): string {
  const source = new URLSearchParams(window.location.search);
  const preserved = new URLSearchParams();
  source.forEach((value, key) => {
    if (key.startsWith("utm_")) preserved.set(key, value);
  });
  const query = preserved.toString();
  return `${getQuizUrl(route)}${query.length > 0 ? `?${query}` : ""}`;
}

function QuizMetadata({ route }: { readonly route: QuizRoutePath }) {
  useEffect(() => {
    const isResult = route === "result";
    document.title = isResult
      ? "Seu ritmo de autocuidado | Belvitale"
      : "Descoberta de rotina CeluClin | Belvitale";
    const descriptionContent = isResult
      ? "Leitura narrativa de preferências de rotina e recomendação comercial transparente do CeluClin, sem diagnóstico ou promessa de resultado."
      : "Sete escolhas e sete momentos narrativos para entender rotina, prova e compromisso antes de uma recomendação comercial transparente do CeluClin.";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]') ?? document.createElement("meta");
    description.name = "description";
    description.content = descriptionContent;
    if (!description.isConnected) document.head.append(description);
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]') ?? document.createElement("meta");
    robots.name = "robots";
    robots.content = quizPublicationApproved
      ? isResult ? "noindex, follow" : "index, follow"
      : "noindex, nofollow";
    if (!robots.isConnected) document.head.append(robots);
  }, [route]);
  return null;
}

function QuizUnavailable() {
  return (
    <main className="quiz-main quiz-main--message" id="conteudo-quiz">
      <div className="quiz-state-message">
        <p className="quiz-kicker">Experiência indisponível</p>
        <h1>Essa experiência não está disponível agora.</h1>
        <p>Enquanto isso, você pode consultar as informações confirmadas e o rótulo original do CeluClin.</p>
        <a className="quiz-primary-action" href="/#celuclin">Ver informações confirmadas do CeluClin</a>
      </div>
    </main>
  );
}

function InvalidResult({ onRestart }: { readonly onRestart: () => void }) {
  return (
    <main className="quiz-main quiz-main--message" id="conteudo-quiz">
      <div className="quiz-state-message">
        <p className="quiz-kicker">Resultado ainda não formado</p>
        <h1>As sete escolhas válidas precisam acontecer antes do resultado.</h1>
        <p>Nenhum perfil ou oferta é criado a partir de um caminho incompleto.</p>
        <button className="quiz-primary-action" type="button" onClick={onRestart}>Começar o quiz</button>
      </div>
    </main>
  );
}

export function QuizExperience() {
  const [state, dispatch] = useReducer(quizMachineReducer, undefined, loadQuizState);
  const [route, setRoute] = useState<QuizRoutePath>(() => getQuizRoutePath(window.location.pathname) ?? "quiz");
  const calculation = useMemo(() => calculateQuizResult(state.answers), [state.answers]);
  const recommendation = useMemo(() => calculateRecommendedPlan(state.answers), [state.answers]);
  const [selectedPlan, setSelectedPlan] = useState<QuizPlanId>(() => recommendation?.plan ?? "30-days");
  const reducedMotion = useReducedMotion();
  const transitionScene = useQuizSceneTransition(reducedMotion);
  const selectionTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  const lastViewedScene = useRef<string | null>(null);
  const profileViewed = useRef(false);
  const offerViewed = useRef(false);

  const answered = getAnsweredCount(state.answers);
  const moment = Math.max(1, quizSceneIds.indexOf(state.scene) + 1);
  const accessMode = getQuizAccessMode(
    quizPublicationStatus,
    import.meta.env.DEV,
    import.meta.env.VITE_INTERNAL_QUIZ === "true" || quizPreviewEnabled,
  );

  useEffect(() => {
    stateRef.current = state;
    saveQuizState(state);
  }, [state]);

  useEffect(() => () => {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
  }, []);

  useEffect(() => {
    function handlePopState() {
      const nextRoute = getQuizRoutePath(window.location.pathname) ?? "quiz";
      transitionScene("backward", () => {
        const currentScene = stateRef.current.scene;
        if (nextRoute === "quiz") {
          if (currentScene === "offer") dispatch({ type: "BACK", now: now() });
          if (currentScene === "offer" || currentScene === "result") {
            dispatch({ type: "BACK", now: now() });
          }
        }
        setRoute(nextRoute);
      });
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [transitionScene]);

  useEffect(() => {
    if (!quizQuestionIds.includes(state.scene as QuizQuestionId)) return;
    if (lastViewedScene.current === state.scene) return;
    lastViewedScene.current = state.scene;
    const step = quizQuestionIds.indexOf(state.scene as QuizQuestionId) + 1;
    recordQuizEvent("quiz_question_viewed", {
      question_id: state.scene as QuizQuestionId,
      step,
    });
  }, [state.scene]);

  useEffect(() => {
    if (state.scene !== "insight-start" && state.scene !== "proof-and-insight") return;
    if (lastViewedScene.current === state.scene) return;
    lastViewedScene.current = state.scene;
    recordQuizEvent("quiz_insight_viewed", {
      insight_id: state.scene === "insight-start" ? "start" : "proof",
    });
  }, [state.scene]);

  useEffect(() => {
    if (route !== "result" || calculation === null || recommendation === null) return;
    if (!profileViewed.current) {
      profileViewed.current = true;
      recordQuizEvent("quiz_profile_viewed", {
        result_profile: calculation.profile,
        recommended_plan: recommendation.plan,
      });
    }
  }, [calculation, recommendation, route]);

  function navigate(nextRoute: QuizRoutePath, replace = false) {
    window.history[replace ? "replaceState" : "pushState"](null, "", buildRouteUrl(nextRoute));
    setRoute(nextRoute);
  }

  function start() {
    transitionScene("forward", () => dispatch({ type: "START", now: now() }));
    recordQuizEvent("quiz_started");
  }

  function select(questionId: QuizQuestionId, optionId: string) {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
    dispatch({ type: "ANSWER", questionId, optionId, now: now() });
    recordQuizEvent("quiz_question_answered", {
      question_id: questionId,
      step: quizQuestionIds.indexOf(questionId) + 1,
    });
    selectionTimer.current = window.setTimeout(() => {
      selectionTimer.current = null;
      transitionScene("forward", () => dispatch({ type: "NEXT", now: now() }));
    }, reducedMotion ? 40 : 280);
  }

  function next() {
    transitionScene("forward", () => dispatch({ type: "NEXT", now: now() }));
  }

  function back() {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
    selectionTimer.current = null;
    transitionScene("backward", () => {
      if (state.scene === "result") navigate("quiz");
      dispatch({ type: "BACK", now: now() });
    });
  }

  function restart() {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
    selectionTimer.current = null;
    clearQuizState();
    transitionScene("backward", () => {
      dispatch({ type: "RESTART", now: now() });
      navigate("quiz", true);
    });
    profileViewed.current = false;
    offerViewed.current = false;
    lastViewedScene.current = null;
    recordQuizEvent("quiz_restarted");
  }

  function revealResult() {
    if (calculation === null || recommendation === null) return;
    transitionScene("forward", () => {
      dispatch({ type: "NEXT", now: now() });
      navigate("result");
    });
    recordQuizEvent("quiz_completed", {
      result_profile: calculation.profile,
      recommended_plan: recommendation.plan,
    });
  }

  function showOffer() {
    if (recommendation === null) return;
    setSelectedPlan(recommendation.plan);
    transitionScene("forward", () => dispatch({ type: "SHOW_OFFER", now: now() }));
    if (!offerViewed.current) {
      offerViewed.current = true;
      recordQuizEvent("quiz_offer_recommended", {
        recommended_plan: recommendation.plan,
      });
    }
  }

  function review(questionId: QuizQuestionId) {
    transitionScene("backward", () => {
      dispatch({ type: "REVIEW", questionId, now: now() });
      navigate("quiz");
    });
  }

  function changePlan(plan: QuizPlanId) {
    setSelectedPlan(plan);
    if (recommendation !== null && plan !== selectedPlan) {
      recordQuizEvent("quiz_offer_changed", {
        recommended_plan: recommendation.plan,
        selected_plan: plan,
      });
    }
  }

  const validResult =
    calculation !== null &&
    recommendation !== null &&
    state.completedAt !== undefined &&
    hasCompleteQuizAnswers(state.answers);

  let content;
  if (accessMode === "unavailable") {
    content = <QuizUnavailable />;
  } else if (route === "result") {
    content = !validResult ? (
      <InvalidResult onRestart={restart} />
    ) : state.scene === "offer" ? (
      <OfferRecommendation
        recommendation={recommendation}
        selectedPlan={selectedPlan}
        onSelectPlan={changePlan}
        onCheckout={() => recordQuizEvent("quiz_checkout_clicked", {
          recommended_plan: recommendation.plan,
          selected_plan: selectedPlan,
        })}
        onBackToResult={back}
      />
    ) : (
      <ResultReveal
        answers={state.answers}
        calculation={calculation}
        recommendation={recommendation}
        onReview={review}
        onShowOffer={showOffer}
      />
    );
  } else if (state.scene === "intro") {
    content = <QuizIntro onStart={start} />;
  } else if (quizQuestionIds.includes(state.scene as QuizQuestionId)) {
    const questionId = state.scene as QuizQuestionId;
    const question = quizQuestionMap[questionId];
    content = (
      <QuestionStage
        question={question}
        selectedId={state.answers[questionId]}
        questionNumber={quizQuestions.findIndex((candidate) => candidate.id === questionId) + 1}
        onSelect={(optionId) => select(questionId, optionId)}
      />
    );
  } else if (state.scene === "insight-start") {
    content = <InsightReveal insight={deriveStartInsight(state.answers)} sequence="first" onContinue={next} />;
  } else if (state.scene === "story-bridge") {
    content = <StoryInterstitial onContinue={next} />;
  } else if (state.scene === "proof-and-insight") {
    content = (
      <main className="quiz-main quiz-main--proof" id="conteudo-quiz">
        <ProofMoment mode="journey" insight={deriveProofInsight(state.answers)} onContinue={next} />
      </main>
    );
  } else {
    content = <ResultAnticipation onReveal={revealResult} />;
  }

  return (
    <QuizShell
      state={state}
      moment={moment}
      answered={answered}
      canGoBack={state.scene !== "intro"}
      onBack={back}
      onRestart={restart}
    >
      <QuizMetadata route={route} />
      <div className="quiz-scene" key={`${route}:${state.scene}`} data-scene={state.scene}>
        <div data-publication-status={quizPublicationStatus}>{content}</div>
      </div>
    </QuizShell>
  );
}
