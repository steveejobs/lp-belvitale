import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { calculateRecommendedPlan } from "../domain/quiz.recommendation";
import { getNextStage, getPreviousStage } from "../domain/quiz.machine";
import {
  quizQuestionIds,
  quizStageIds,
  type ConcernId,
  type QuizDirection,
  type QuizProfileResult,
  type QuizQuestionId,
  type QuizStageId,
} from "../domain/quiz.types";
import { quizQuestionMap } from "../content/questions";
import { quizMotion } from "../motion/motion.tokens";
import { useQuizSceneTransition } from "../motion/useQuizSceneTransition";
import { QuizProvider } from "../state/QuizProvider";
import { useQuiz } from "../state/quiz.context";
import { trackQuizEvent } from "../tracking/analytics.events";
import { AnticipationStage } from "./AnticipationStage";
import { InsightStage } from "./InsightStage";
import { NameStage } from "./NameStage";
import { QuestionStage } from "./QuestionStage";
import { QuizHeader } from "./QuizHeader";
import { QuizIntro } from "./QuizIntro";
import { QuizShell } from "./QuizShell";
import { StoryStage } from "./StoryStage";
import "../quiz.css";

const loadProofStage = () => import("./ProofStage");
const loadResultStage = () => import("./ResultStage");
const loadOfferStage = () => import("./OfferStage");

const ProofStage = lazy(() => loadProofStage().then((module) => ({ default: module.ProofStage })));
const ResultStage = lazy(() => loadResultStage().then((module) => ({ default: module.ResultStage })));
const OfferStage = lazy(() => loadOfferStage().then((module) => ({ default: module.OfferStage })));

function concernFromAnswer(value: string | undefined): ConcernId {
  if (value === "cellulite" || value === "firmness" || value === "contour") return value;
  return "balanced";
}

function insightOne(triggerId: string | undefined): readonly [string, string] {
  if (triggerId === "self-last") {
    return ["Seu ponto de partida parece ser retomada, não cobrança.", "A cena escolhida fala de voltar a se incluir no dia — não de aumentar pressão."];
  }
  if (triggerId === "unexpected-photo") {
    return ["Seu incômodo aparece de surpresa, antes de existir um plano.", "Por isso, a próxima parte separa reação imediata de uma escolha que consiga continuar."];
  }
  return ["O incômodo ficou concreto porque apareceu dentro de uma cena real.", "Isso torna a leitura mais específica do que perguntar apenas se você quer melhorar a rotina."];
}

function insightTwo(attemptId: string | undefined, proofId: string | undefined): readonly [string, string] {
  if (attemptId === "research-delayed" || proofId === "composition-use") {
    return ["Sua escolha parece depender mais de confiança do que de impulso.", "Você pediu informação objetiva; a oferta precisará explicar origem, limites e diferença entre as opções."];
  }
  if (attemptId === "routine-tightened") {
    return ["Quando a rotina falha, o problema parece ser retomada, não começo.", "Seu resultado vai priorizar um ponto de retorno pequeno em vez de uma meta maior."];
  }
  return ["Você não precisa abrir todas as decisões ao mesmo tempo.", "Prova, continuidade e compra serão apresentadas em camadas separadas para reduzir confusão."];
}

function QuizJourney() {
  const { state, dispatch, restart } = useQuiz();
  const [direction, setDirection] = useState<QuizDirection>("forward");
  const [confirming, setConfirming] = useState(false);
  const [outcome, setOutcome] = useState<{ readonly answerKey: string; readonly result: QuizProfileResult | null } | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const transition = useQuizSceneTransition(state.stageId, direction);
  const concern = concernFromAnswer(state.answers.concern);
  const recommendation = calculateRecommendedPlan(state.answers);
  const answerKey = quizQuestionIds.map((questionId) => state.answers[questionId] ?? "").join("|");
  const result = outcome?.answerKey === answerKey ? outcome.result : null;
  const resultResolved = outcome?.answerKey === answerKey;

  const goTo = useCallback((stageId: QuizStageId, nextDirection: QuizDirection = "forward") => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
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
  }, []);

  useEffect(() => {
    // Carrega cada bloco apenas quando a jornada se aproxima dele. As imagens
    // da galeria continuam lazy e nao entram no carregamento da abertura.
    if (state.stageId === "recovery" || state.stageId === "proof-preference") void loadProofStage();
    if (state.stageId === "readiness" || state.stageId === "continuity") void loadResultStage();
    if (state.stageId === "anticipation" || state.stageId === "result") void loadOfferStage();
  }, [state.stageId]);

  useEffect(() => {
    const complete = quizQuestionIds.every((questionId) => typeof state.answers[questionId] === "string");
    if (!complete) return;

    let active = true;
    void import("../domain/quiz.scoring").then(({ calculateQuizResult }) => {
      if (!active) return;
      setOutcome({ answerKey, result: calculateQuizResult(state.answers) });
    });
    return () => { active = false; };
  }, [answerKey, state.answers]);

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
      concernId: concern,
      ...(result === null ? {} : { profileId: result.id }),
      ...(recommendation === null ? {} : { recommendedOfferId: recommendation.offerId }),
    }, transition.displayedStageId);
    if (transition.displayedStageId === "proof") {
      trackQuizEvent("quiz_proof_viewed", { sessionId: state.sessionId, stageId: "proof", concernId: concern }, "proof");
    }
    if (transition.displayedStageId === "insight-one" || transition.displayedStageId === "insight-two") {
      trackQuizEvent("quiz_insight_viewed", { sessionId: state.sessionId, stageId: transition.displayedStageId }, transition.displayedStageId);
    }
  }, [concern, recommendation, result, state.sessionId, transition.displayedStageId, transition.phase]);

  useEffect(() => {
    let redirectTimer: number | undefined;
    if (state.stageId === "result" && resultResolved && (result === null || recommendation === null)) {
      redirectTimer = window.setTimeout(() => goTo("opening", "backward"), 0);
    } else if ((state.stageId === "result" || state.stageId === "offer") && window.location.pathname !== "/quiz/resultado") {
      window.history.replaceState({}, "", "/quiz/resultado" + window.location.search);
    }
    return () => {
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [goTo, recommendation, result, resultResolved, state.stageId]);

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
    const question = quizQuestionMap[questionId];
    if (question.autoAdvance) {
      advanceTimer.current = window.setTimeout(() => goTo(getNextStage(questionId)), quizMotion.autoAdvanceDelayMs);
    } else {
      window.setTimeout(() => setConfirming(false), quizMotion.selectionMs);
    }
  };

  const back = () => {
    if (state.stageId === "opening") return;
    trackQuizEvent("quiz_back_clicked", { sessionId: state.sessionId, stageId: state.stageId });
    goTo(getPreviousStage(state.stageId), "backward");
  };

  const start = () => {
    const now = new Date().toISOString();
    dispatch({ type: "START", now });
    setDirection("forward");
    trackQuizEvent("quiz_started", { sessionId: state.sessionId }, "started");
  };

  const content = (() => {
    const stageId = transition.displayedStageId;
    if (stageId === "opening") return <QuizIntro onStart={start} />;
    if (stageId === "name") {
      return <NameStage initialName={state.firstName} onContinue={(name, provided) => {
        dispatch({ type: "SET_NAME", value: name, provided });
        trackQuizEvent(provided ? "quiz_name_submitted" : "quiz_name_skipped", {
          sessionId: state.sessionId,
          stageId: "name",
          nameProvided: provided,
        }, "name");
        goTo("trigger");
      }} />;
    }
    if (quizQuestionIds.some((id) => id === stageId)) {
      const questionId = stageId as QuizQuestionId;
      const question = quizQuestionMap[questionId];
      return (
        <QuestionStage
          question={question}
          selectedOptionId={state.answers[questionId]}
          isConfirming={confirming}
          onSelect={(optionId) => answer(questionId, optionId)}
          onContinue={() => goTo(getNextStage(questionId))}
        />
      );
    }
    if (stageId === "insight-one") {
      const copy = insightOne(state.answers.trigger);
      return <InsightStage sequence={1} name={state.firstName} insight={copy[0]} explanation={copy[1]} onContinue={() => goTo("impact")} />;
    }
    if (stageId === "story") return <StoryStage onContinue={() => goTo("recovery")} />;
    if (stageId === "proof") return <ProofStage concern={concern} onContinue={() => goTo("insight-two")} />;
    if (stageId === "insight-two") {
      const copy = insightTwo(state.answers.attempts, state.answers["proof-preference"]);
      return <InsightStage sequence={2} name="" insight={copy[0]} explanation={copy[1]} onContinue={() => goTo("readiness")} />;
    }
    if (stageId === "anticipation") {
      return <AnticipationStage name={state.firstName} onReveal={() => {
        const now = new Date().toISOString();
        dispatch({ type: "COMPLETE", now });
        setDirection("forward");
        window.history.pushState({}, "", "/quiz/resultado" + window.location.search);
        trackQuizEvent("quiz_completed", {
          sessionId: state.sessionId,
          concernId: concern,
          ...(result === null ? {} : { profileId: result.id }),
          ...(recommendation === null ? {} : { recommendedOfferId: recommendation.offerId }),
        }, "completed");
      }} />;
    }
    if (stageId === "result" && result !== null && recommendation !== null) {
      return <ResultStage name={state.firstName} answers={state.answers} concern={concern} result={result} recommendation={recommendation} onContinue={() => {
        trackQuizEvent("quiz_profile_revealed", {
          sessionId: state.sessionId,
          stageId: "result",
          profileId: result.id,
          concernId: concern,
          recommendedOfferId: recommendation.offerId,
        }, result.id);
        goTo("offer");
      }} />;
    }
    if (stageId === "offer" && result !== null && recommendation !== null) {
      const selectedOfferId = state.selectedOfferId ?? recommendation.offerId;
      return <OfferStage sessionId={state.sessionId} profileId={result.id} recommendation={recommendation} selectedOfferId={selectedOfferId} onSelectOffer={(offerId) => dispatch({ type: "SELECT_OFFER", offerId })} />;
    }
    if ((stageId === "result" || stageId === "offer") && !resultResolved) {
      return <div className="q6-stage-loading" role="status">Preparando sua leituraâ€¦</div>;
    }
    return <QuizIntro onStart={start} />;
  })();

  return (
    <div className="quiz-route q6" data-version="6.0.0">
      <a className="q6-skip" href="#conteudo-quiz">Ir para o conteúdo do quiz</a>
      <QuizHeader
        stageId={state.stageId}
        answers={state.answers}
        canGoBack={state.stageId !== "opening"}
        onBack={back}
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
        <Suspense fallback={<div className="q6-stage-loading" role="status">Preparando esta parteâ€¦</div>}>
          <div key={transition.displayedStageId}>{content}</div>
        </Suspense>
      </QuizShell>
      <div className="q6-announcer sr-only" aria-live="polite">
        Momento {quizStageIds.indexOf(transition.displayedStageId) + 1} de 17.
      </div>
    </div>
  );
}

export function QuizExperience() {
  return <QuizProvider><QuizJourney /></QuizProvider>;
}
