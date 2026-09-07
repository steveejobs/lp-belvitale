import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { buildPersonalizedInsight } from "../content/insights";
import { quizQuestionMap } from "../content/questions";
import { calculateRecommendedPlan } from "../domain/quiz.recommendation";
import { getNextStage, getPreviousStage } from "../domain/quiz.machine";
import {
  quizQuestionIds,
  type QuizDirection,
  type QuizQuestionId,
  type QuizStageId,
} from "../domain/quiz.types";
import { quizMotion } from "../motion/motion.tokens";
import { getQuizExperimentAssignment } from "../experiment/quiz.experiment";
import { useQuizSceneTransition } from "../motion/useQuizSceneTransition";
import { QuizProvider } from "../state/QuizProvider";
import { useQuiz } from "../state/quiz.context";
import { trackQuizEvent } from "../tracking/analytics.events";
import { InsightStage } from "./InsightStage";
import { AnalysisStage } from "./AnalysisStage";
import { NameStage } from "./NameStage";
import { QuestionStage } from "./QuestionStage";
import { QuizHeader } from "./QuizHeader";
import { QuizFooter } from "./QuizFooter";
import { QuizIntro } from "./QuizIntro";
import { QuizShell } from "./QuizShell";
import "../quiz.css";
import "../quiz-refined.css";

const loadResultStage = () => import("./ResultStage");
const loadOfferStage = () => import("./OfferStage");
const ResultStage = lazy(() => loadResultStage().then((module) => ({ default: module.ResultStage })));
const OfferStage = lazy(() => loadOfferStage().then((module) => ({ default: module.OfferStage })));

function QuizJourney() {
  const { state, dispatch, restart } = useQuiz();
  const [direction, setDirection] = useState<QuizDirection>("forward");
  const [confirming, setConfirming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const analysisTimer = useRef<number | null>(null);
  const transition = useQuizSceneTransition(state.stageId, direction);
  const recommendation = calculateRecommendedPlan(state.answers);
  const experiment = getQuizExperimentAssignment();

  const goTo = useCallback((stageId: QuizStageId, nextDirection: QuizDirection = "forward") => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    if (analysisTimer.current !== null) window.clearTimeout(analysisTimer.current);
    setIsAnalyzing(false);
    setConfirming(false);
    setDirection(nextDirection);
    dispatch({ type: "GO_TO", stageId });
    if (stageId === "result" || stageId === "offer") {
      window.history.pushState({}, "", "/quiz/resultado" + window.location.search);
    } else if (window.location.pathname !== "/quiz") {
      window.history.pushState({}, "", "/quiz" + window.location.search);
    }
  }, [dispatch]);

  useEffect(() => () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    if (analysisTimer.current !== null) window.clearTimeout(analysisTimer.current);
  }, []);

  useEffect(() => {
    if (state.stageId === "future-goal" || state.stageId === "insight-three") void loadResultStage();
    if (state.stageId === "result") void loadOfferStage();
  }, [state.stageId]);

  useEffect(() => {
    trackQuizEvent("quiz_opened", { sessionId: state.sessionId }, "opened");
    const checkoutStarted = sessionStorage.getItem("belvitale.quiz.checkout-return");
    if (checkoutStarted !== null) {
      sessionStorage.removeItem("belvitale.quiz.checkout-return");
      trackQuizEvent("quiz_checkout_returned", { sessionId: state.sessionId }, checkoutStarted);
    }
  }, [state.sessionId]);

  useEffect(() => {
    if (transition.phase !== "active") return;
    trackQuizEvent("quiz_stage_viewed", {
      sessionId: state.sessionId,
      stageId: transition.displayedStageId,
      ...(recommendation === null ? {} : { recommendedOfferId: recommendation.offerId }),
    }, transition.displayedStageId);
    if (transition.displayedStageId.startsWith("insight-")) {
      trackQuizEvent("quiz_insight_viewed", {
        sessionId: state.sessionId,
        stageId: transition.displayedStageId,
      }, transition.displayedStageId);
    }
  }, [recommendation, state.sessionId, transition.displayedStageId, transition.phase]);

  useEffect(() => {
    if ((state.stageId === "result" || state.stageId === "offer") && recommendation === null) {
      const timer = window.setTimeout(() => goTo("opening", "backward"), 0);
      return () => window.clearTimeout(timer);
    }
    if ((state.stageId === "result" || state.stageId === "offer") && window.location.pathname !== "/quiz/resultado") {
      window.history.replaceState({}, "", "/quiz/resultado" + window.location.search);
    }
  }, [goTo, recommendation, state.stageId]);

  const answer = (questionId: QuizQuestionId, optionId: string) => {
    if (confirming) return;
    const previous = state.answers[questionId];
    dispatch({ type: "ANSWER", questionId, optionId });
    setConfirming(true);
    trackQuizEvent(previous === undefined || previous === optionId ? "quiz_answer_selected" : "quiz_answer_changed", {
      sessionId: state.sessionId,
      stageId: questionId,
      questionId,
      optionId,
    });
    advanceTimer.current = window.setTimeout(() => goTo(getNextStage(questionId)), quizMotion.autoAdvanceDelayMs);
  };

  const start = () => {
    const now = new Date().toISOString();
    dispatch({ type: "START", now });
    setDirection("forward");
    trackQuizEvent("quiz_started", { sessionId: state.sessionId }, "started");
  };

  const showAnalysis = isAnalyzing || (state.stageId === "result" && transition.displayedStageId === "insight-three");
  const content = (() => {
    const stageId = transition.displayedStageId;
    if (showAnalysis) return <AnalysisStage />;
    if (stageId === "opening") return <QuizIntro onStart={start} />;
    if (stageId === "name") {
      return <NameStage initialName={state.firstName} onContinue={(name, provided) => {
        dispatch({ type: "SET_NAME", value: name, provided });
        trackQuizEvent(provided ? "quiz_name_submitted" : "quiz_name_skipped", {
          sessionId: state.sessionId,
          stageId: "name",
          nameProvided: provided,
        }, "name");
        goTo("perception");
      }} />;
    }
    if (quizQuestionIds.some((id) => id === stageId)) {
      const questionId = stageId as QuizQuestionId;
      return (
        <QuestionStage
          question={quizQuestionMap[questionId]}
          selectedOptionId={state.answers[questionId]}
          isConfirming={confirming}
          onSelect={(optionId) => answer(questionId, optionId)}
          onContinue={() => goTo(getNextStage(questionId))}
        />
      );
    }
    if (stageId === "insight-one" || stageId === "insight-two" || stageId === "insight-three") {
      const sequence = stageId === "insight-one" ? 1 : stageId === "insight-two" ? 2 : 3;
      const insight = buildPersonalizedInsight(sequence, state.answers);
      return <InsightStage {...insight} onContinue={() => {
        if (stageId === "insight-three") {
          setIsAnalyzing(true);
          analysisTimer.current = window.setTimeout(() => {
            const now = new Date().toISOString();
            setIsAnalyzing(false);
            dispatch({ type: "COMPLETE", now });
            trackQuizEvent("quiz_completed", {
              sessionId: state.sessionId,
              ...(recommendation === null ? {} : { recommendedOfferId: recommendation.offerId }),
            }, "completed");
          }, 2200);
          return;
        }
        goTo(getNextStage(stageId));
      }} />;
    }
    if (stageId === "result" && recommendation !== null) {
      return <ResultStage name={state.firstName} answers={state.answers} recommendation={recommendation} onContinue={() => {
        trackQuizEvent("quiz_profile_revealed", {
          sessionId: state.sessionId,
          stageId: "result",
          recommendedOfferId: recommendation.offerId,
        }, "routine-real");
        goTo("offer");
      }} />;
    }
    if (stageId === "offer" && recommendation !== null) {
      const selectedOfferId = state.selectedOfferId ?? recommendation.offerId;
      return <OfferStage sessionId={state.sessionId} recommendation={recommendation} selectedOfferId={selectedOfferId} onSelectOffer={(offerId) => dispatch({ type: "SELECT_OFFER", offerId })} />;
    }
    return <div className="q7-loading" role="status">Preparando sua leitura…</div>;
  })();

  return (
    <div className="quiz-route q7" data-version="7.1.0" data-experiment-variant={experiment.variant}>
      <a className="q7-skip" href="#conteudo-quiz">Ir para o conteúdo do quiz</a>
      <QuizHeader
        stageId={state.stageId}
        answers={state.answers}
        canGoBack={state.stageId !== "opening"}
        onBack={() => {
          trackQuizEvent("quiz_back_clicked", { sessionId: state.sessionId, stageId: state.stageId });
          goTo(getPreviousStage(state.stageId), "backward");
        }}
        onRestart={() => {
          trackQuizEvent("quiz_restarted", { sessionId: state.sessionId, stageId: state.stageId });
          restart();
        }}
      />
      <QuizShell
        stageId={transition.displayedStageId}
        phase={transition.phase}
        direction={transition.direction}
        reducedMotion={transition.reducedMotion}
      >
        <Suspense fallback={<div className="q7-loading" role="status">Preparando esta parte…</div>}>
          <div key={`${transition.displayedStageId}-${showAnalysis ? "analysis" : "content"}`}>{content}</div>
        </Suspense>
      </QuizShell>
      <QuizFooter />
    </div>
  );
}

export function QuizExperience() {
  return <QuizProvider><QuizJourney /></QuizProvider>;
}
