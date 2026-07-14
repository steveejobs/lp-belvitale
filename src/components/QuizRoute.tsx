import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { canonicalUrl } from "../config/site";
import {
  getQuizAccessMode,
} from "../data/quizPublication";
import {
  quizPublicationApproved,
  quizPublicationStatus,
} from "../data/quizPublicationConfig";
import { quizQuestions, type QuizQuestion } from "../data/quizQuestions";
import { quizProfiles, type QuizProfile } from "../data/quizProfiles";
import {
  calculateQuizProfile,
  type QuizAnswer,
} from "../quiz/quizScoring";
import { recordQuizEvent } from "../quiz/quizEvents";
import {
  clearQuizState,
  createInitialQuizState,
  loadQuizState,
  saveQuizState,
  type QuizStoredState,
} from "../quiz/quizStorage";
import {
  getQuizRoutePath,
  getQuizUrl,
  type QuizRoutePath,
} from "../quiz/quizRouting";
import "../quiz/quiz.css";

const privacyNotice =
  "Este quiz não solicita dados pessoais e não realiza diagnóstico. As respostas ficam armazenadas apenas neste dispositivo para permitir que você continue depois.";

function useTitleFocus(
  reference: RefObject<HTMLHeadingElement | null>,
  changeKey: string | number,
) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => reference.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [changeKey, reference]);
}

function QuizMetadata({ path }: { readonly path: QuizRoutePath }) {
  useEffect(() => {
    const isResult = path === "result";
    globalThis.document.title = isResult
      ? "Perfil de rotina | Belvitale"
      : "Quiz de rotina | Belvitale";

    const descriptionText = isResult
      ? "Consulte seu perfil neutro de rotina de autocuidado, sem diagnóstico ou promessa de resultado."
      : "Responda seis perguntas sobre hábitos e preferências para conhecer um perfil neutro de rotina de autocuidado.";
    let description = globalThis.document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description === null) {
      description = globalThis.document.createElement("meta");
      description.name = "description";
      globalThis.document.head.append(description);
    }
    description.content = descriptionText;

    let robots = globalThis.document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    if (robots === null) {
      robots = globalThis.document.createElement("meta");
      robots.name = "robots";
      globalThis.document.head.append(robots);
    }
    const resultRoute = path === "result";
    robots.content = quizPublicationApproved
      ? resultRoute
        ? "noindex, follow"
        : "index, follow"
      : "noindex, nofollow";

    const currentCanonical = globalThis.document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!quizPublicationApproved || canonicalUrl === null) {
      currentCanonical?.remove();
    } else {
      const canonical =
        currentCanonical ?? globalThis.document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = new URL(getQuizUrl("quiz"), canonicalUrl).toString();
      if (currentCanonical === null) globalThis.document.head.append(canonical);
    }

    const openGraphValues = {
      "og:title": "Quiz de rotina | Belvitale",
      "og:description":
        "Seis perguntas sobre hábitos e preferências para conhecer um perfil neutro de rotina de autocuidado.",
      "og:type": "website",
      ...(canonicalUrl === null
        ? {}
        : { "og:url": new URL(getQuizUrl("quiz"), canonicalUrl).toString() }),
    };

    globalThis.document
      .querySelectorAll<HTMLMetaElement>('meta[property^="og:"]')
      .forEach((meta) => {
        if (!quizPublicationApproved) meta.remove();
      });

    if (quizPublicationApproved) {
      Object.entries(openGraphValues).forEach(([property, content]) => {
        const existing = globalThis.document.querySelector<HTMLMetaElement>(
          `meta[property="${property}"]`,
        );
        const meta = existing ?? globalThis.document.createElement("meta");
        meta.setAttribute("property", property);
        meta.content = content;
        if (existing === null) globalThis.document.head.append(meta);
      });
    }

    globalThis.document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((schema) => schema.remove());
  }, [path]);

  return null;
}

function QuizPrivacyNotice() {
  return <p className="quiz-privacy">{privacyNotice}</p>;
}

function QuizBrand() {
  return (
    <header className="quiz-header">
      <div className="quiz-shell quiz-header__inner">
        <a className="quiz-brand" href="/" aria-label="Belvitale — início">
          Belvitale
        </a>
        <span>Autocuidado com transparência</span>
      </div>
    </header>
  );
}

function QuizStart({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, "start");

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-start">
        <div className="quiz-start__line" aria-hidden="true" />
        <div className="quiz-start__content">
          <p className="quiz-eyebrow">Quiz de rotina</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Qual tipo de rotina combina com o seu momento?
          </h1>
          <p className="quiz-lead">
            Responda seis perguntas rápidas sobre seus hábitos e preferências. O
            resultado não é diagnóstico nem recomendação médica.
          </p>
          <button className="quiz-button quiz-button--primary" onClick={onStart}>
            Começar o quiz
          </button>
          <p className="quiz-microcopy">
            Leva cerca de 1 minuto. Nenhum dado pessoal é solicitado.
          </p>
        </div>
        <QuizPrivacyNotice />
      </div>
    </main>
  );
}

interface QuizQuestionScreenProps {
  readonly question: QuizQuestion;
  readonly step: number;
  readonly selectedOptionId: string | null;
  readonly direction: "forward" | "backward";
  readonly errorVisible: boolean;
  readonly onBack: () => void;
  readonly onContinue: () => void;
  readonly onSelect: (optionId: string) => void;
}

function QuizQuestionScreen({
  question,
  step,
  selectedOptionId,
  direction,
  errorVisible,
  onBack,
  onContinue,
  onSelect,
}: QuizQuestionScreenProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, question.id);
  const errorId = `quiz-error-${question.id}`;
  const progress = ((step + 1) / quizQuestions.length) * 100;

  function selectOption(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.currentTarget.value);
  }

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div
        className="quiz-shell quiz-question"
        data-direction={direction}
        key={question.id}
      >
        <div className="quiz-question__topline">
          <button className="quiz-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Voltar
          </button>
          <p aria-live="polite">
            Pergunta {String(step + 1)} de {String(quizQuestions.length)}
          </p>
        </div>

        <div
          className="quiz-progress"
          role="progressbar"
          aria-label="Progresso do quiz"
          aria-valuemin={1}
          aria-valuemax={quizQuestions.length}
          aria-valuenow={step + 1}
          aria-valuetext={`Pergunta ${String(step + 1)} de ${String(quizQuestions.length)}`}
        >
          <span style={{ width: `${String(progress)}%` }} />
        </div>

        <section className="quiz-step" aria-labelledby="quiz-question-title">
          <p className="quiz-eyebrow">Sobre sua rotina</p>
          <h1 id="quiz-question-title" ref={titleRef} tabIndex={-1}>
            {question.title}
          </h1>

          <fieldset
            className="quiz-options"
            aria-describedby={errorVisible ? errorId : undefined}
            aria-invalid={errorVisible}
          >
            <legend className="sr-only">Escolha uma resposta</legend>
            {question.options.map((option, index) => (
              <label className="quiz-option" key={option.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={selectOption}
                />
                <span className="quiz-option__marker" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <p
            className="quiz-error"
            id={errorId}
            role={errorVisible ? "alert" : undefined}
            hidden={!errorVisible}
          >
            Escolha uma resposta para continuar.
          </p>

          <button
            className="quiz-button quiz-button--primary quiz-question__continue"
            type="button"
            onClick={onContinue}
          >
            {step === quizQuestions.length - 1
              ? "Ver meu perfil"
              : "Continuar"}
          </button>
        </section>

        <QuizPrivacyNotice />
      </div>
    </main>
  );
}

function QuizResult({
  profileId,
  onRestart,
}: {
  readonly profileId: QuizProfile;
  readonly onRestart: () => void;
}) {
  const profile = quizProfiles[profileId];
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, profileId);

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-result">
        <div className="quiz-result__intro">
          <p className="quiz-eyebrow">{profile.eyebrow}</p>
          <h1 ref={titleRef} tabIndex={-1}>
            Seu perfil é {profile.title}.
          </h1>
          <p className="quiz-lead">{profile.description}</p>
        </div>

        <section className="quiz-result__details" aria-labelledby="traits-title">
          <h2 id="traits-title">O que caracteriza este momento</h2>
          <ul>
            {profile.characteristics.map((characteristic) => (
              <li key={characteristic}>{characteristic}</li>
            ))}
          </ul>
          <div className="quiz-next-step">
            <p className="quiz-eyebrow">Próximo passo</p>
            <p>{profile.nextStep}</p>
          </div>
          <div className="quiz-result__actions">
            <a
              className="quiz-button quiz-button--primary"
              href="/#composicao"
              onClick={() =>
                recordQuizEvent("quiz_composition_click", { source: "quiz" })
              }
            >
              Ver composição
            </a>
            <button
              className="quiz-button quiz-button--secondary"
              type="button"
              onClick={onRestart}
            >
              Recomeçar quiz
            </button>
          </div>
        </section>

        <QuizPrivacyNotice />
      </div>
    </main>
  );
}

function QuizInvalidResult({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, "invalid-result");

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-unavailable quiz-invalid-result">
        <p className="quiz-eyebrow">Quiz de rotina</p>
        <h1 ref={titleRef} tabIndex={-1}>
          Este resultado não está disponível.
        </h1>
        <p>
          Para conhecer um perfil de rotina, responda às seis perguntas do quiz.
          Nenhum resultado é criado sem respostas válidas.
        </p>
        <button
          className="quiz-button quiz-button--primary"
          type="button"
          onClick={onStart}
        >
          Começar o quiz
        </button>
      </div>
    </main>
  );
}

function QuizUnavailable() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, "unavailable");

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-unavailable">
        <p className="quiz-eyebrow">Quiz de rotina</p>
        <h1 ref={titleRef} tabIndex={-1}>
          Esta experiência ainda não está publicada.
        </h1>
        <p>
          Você pode consultar agora as informações confirmadas sobre a composição
          e o modo de uso do CeluClin.
        </p>
        <a className="quiz-button quiz-button--primary" href="/#composicao">
          Ver composição
        </a>
      </div>
    </main>
  );
}

function upsertAnswer(
  answers: readonly QuizAnswer[],
  questionId: string,
  optionId: string,
): readonly QuizAnswer[] {
  const updated = answers.filter((answer) => answer.questionId !== questionId);
  return [...updated, { questionId, optionId }];
}

export function QuizRoute() {
  const initialRoute = getQuizRoutePath(globalThis.location.pathname) ?? "quiz";
  const [route, setRoute] = useState<QuizRoutePath>(initialRoute);
  const [quizState, setQuizState] = useState<QuizStoredState>(loadQuizState);
  const [direction, setDirection] = useState<"forward" | "backward">(
    "forward",
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const viewRecorded = useRef(false);
  const internalFlag = import.meta.env.VITE_INTERNAL_QUIZ === "true";
  const accessMode = getQuizAccessMode(
    quizPublicationStatus,
    import.meta.env.DEV,
    internalFlag,
  );

  function navigate(nextRoute: QuizRoutePath, replace = false) {
    const method = replace ? "replaceState" : "pushState";
    globalThis.history[method](null, "", getQuizUrl(nextRoute));
    setRoute(nextRoute);
  }

  useEffect(() => {
    function handlePopState() {
      setRoute(getQuizRoutePath(globalThis.location.pathname) ?? "quiz");
    }
    globalThis.addEventListener("popstate", handlePopState);
    return () => globalThis.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (accessMode !== "interactive" || viewRecorded.current) return;
    viewRecorded.current = true;
    recordQuizEvent("quiz_view", { source: "quiz" });
  }, [accessMode]);

  function persistState(nextState: QuizStoredState) {
    setQuizState(nextState);
    saveQuizState(nextState);
  }

  function startQuiz() {
    setDirection("forward");
    setErrorVisible(false);
    persistState({ answers: quizState.answers, currentStep: 0 });
    recordQuizEvent("quiz_start", { source: "quiz" });
  }

  function startFromInvalidResult() {
    clearQuizState();
    setDirection("forward");
    setErrorVisible(false);
    persistState({ answers: [], currentStep: 0 });
    recordQuizEvent("quiz_start", { source: "quiz" });
    navigate("quiz", true);
  }

  function selectOption(optionId: string) {
    const question = quizQuestions[quizState.currentStep];
    if (question === undefined) return;
    setErrorVisible(false);
    persistState({
      answers: upsertAnswer(quizState.answers, question.id, optionId),
      currentStep: quizState.currentStep,
    });
  }

  function continueQuiz() {
    const question = quizQuestions[quizState.currentStep];
    if (question === undefined) return;
    const answered = quizState.answers.some(
      (answer) => answer.questionId === question.id,
    );
    if (!answered) {
      setErrorVisible(true);
      return;
    }

    setErrorVisible(false);
    setDirection("forward");
    recordQuizEvent("quiz_step_complete", {
      source: "quiz",
      step: quizState.currentStep + 1,
    });
    if (quizState.currentStep < quizQuestions.length - 1) {
      persistState({
        answers: quizState.answers,
        currentStep: quizState.currentStep + 1,
      });
      return;
    }

    const profile = calculateQuizProfile(quizState.answers);
    const completedState: QuizStoredState = {
      answers: quizState.answers,
      currentStep: quizQuestions.length,
      profile,
      completedAt: new Date().toISOString(),
    };
    persistState(completedState);
    recordQuizEvent("quiz_complete", { source: "quiz", profile });
    navigate("result");
  }

  function goBack() {
    setErrorVisible(false);
    setDirection("backward");
    persistState({
      answers: quizState.answers,
      currentStep: Math.max(-1, quizState.currentStep - 1),
    });
  }

  function restartQuiz() {
    clearQuizState();
    setDirection("backward");
    setErrorVisible(false);
    setQuizState(createInitialQuizState());
    recordQuizEvent("quiz_restart", { source: "quiz" });
    navigate("quiz");
  }

  const currentQuestion = quizQuestions[quizState.currentStep];
  const selectedOptionId =
    currentQuestion === undefined
      ? null
      : (quizState.answers.find(
          (answer) => answer.questionId === currentQuestion.id,
        )?.optionId ?? null);

  return (
    <div className="quiz-route" data-publication-status={quizPublicationStatus}>
      <QuizMetadata path={route} />
      <a className="skip-link" href="#conteudo-quiz">
        Ir para o conteúdo
      </a>
      <QuizBrand />
      {accessMode === "unavailable" ? (
        <QuizUnavailable />
      ) : route === "result" && quizState.profile !== undefined ? (
        <QuizResult profileId={quizState.profile} onRestart={restartQuiz} />
      ) : route === "result" ? (
        <QuizInvalidResult onStart={startFromInvalidResult} />
      ) : quizState.currentStep < 0 || currentQuestion === undefined ? (
        <QuizStart onStart={startQuiz} />
      ) : (
        <QuizQuestionScreen
          question={currentQuestion}
          step={quizState.currentStep}
          selectedOptionId={selectedOptionId}
          direction={direction}
          errorVisible={errorVisible}
          onBack={goBack}
          onContinue={continueQuiz}
          onSelect={selectOption}
        />
      )}
    </div>
  );
}
