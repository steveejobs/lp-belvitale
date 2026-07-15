import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { canonicalUrl } from "../config/site";
import {
  campaignAssets,
  canRenderCampaignAsset,
  internalMediaPreview,
} from "../data/campaignAssets";
import { getQuizAccessMode } from "../data/quizPublication";
import {
  quizPublicationApproved,
  quizPublicationStatus,
} from "../data/quizPublicationConfig";
import { quizQuestions, type QuizQuestion } from "../data/quizQuestions";
import { quizProfiles, type QuizProfile } from "../data/quizProfiles";
import { proofAssets, proofAuthorization } from "../data/proofGallery";
import { resolveQuizRecommendation } from "../quiz/quizRecommendation";
import { recordQuizEvent } from "../quiz/quizEvents";
import {
  getQuizRoutePath,
  getQuizUrl,
  type QuizRoutePath,
} from "../quiz/quizRouting";
import {
  calculateQuizProfile,
  type QuizAnswer,
} from "../quiz/quizScoring";
import {
  clearQuizState,
  createInitialQuizState,
  loadQuizState,
  saveQuizState,
  type QuizStoredState,
} from "../quiz/quizStorage";
import "../quiz/quiz.css";

const privacyNotice =
  "Sem diagnóstico, sem dados pessoais. As respostas ficam neste dispositivo por até 30 dias para você poder continuar depois.";

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
    document.title = isResult
      ? "Seu ritmo de autocuidado | Belvitale"
      : "Onde o seu cuidado encontra ritmo? | Belvitale";

    const descriptionText = isResult
      ? "Um perfil de organização da rotina de autocuidado, sem diagnóstico ou promessa de resultado."
      : "Seis escolhas rápidas para descobrir o que ajuda uma rotina de autocuidado a caber na vida real.";
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description === null) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = descriptionText;

    let robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
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

    const currentCanonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!quizPublicationApproved || canonicalUrl === null) {
      currentCanonical?.remove();
    } else {
      const canonical =
        currentCanonical ?? document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = new URL(getQuizUrl("quiz"), canonicalUrl).toString();
      if (currentCanonical === null) document.head.append(canonical);
    }

    document
      .querySelectorAll<HTMLMetaElement>('meta[property^="og:"]')
      .forEach((meta) => meta.remove());
    if (quizPublicationApproved && canonicalUrl !== null) {
      const values = {
        "og:title": "Onde o seu cuidado encontra ritmo? | Belvitale",
        "og:description":
          "Seis escolhas rápidas sobre começo, retomada e vida real.",
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

function QuizPrivacyNotice() {
  return <p className="quiz-privacy">{privacyNotice}</p>;
}

function QuizBrand() {
  return (
    <header className="quiz-header">
      <div className="quiz-shell quiz-header__inner">
        <a className="quiz-brand" href="/" aria-label="Belvitale — início">
          belvitale
        </a>
        <span>CeluClin · escolha 01—06</span>
      </div>
    </header>
  );
}

function QuizStart({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, "start");

  const capsules = campaignAssets.capsules;
  const canShowCapsules = canRenderCampaignAsset(capsules);

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-start">
        <div className="quiz-start__art">
          {canShowCapsules ? (
            <img src={capsules.src} width={capsules.width} height={capsules.height} alt="" fetchPriority="high" decoding="async" />
          ) : null}
          <span aria-hidden="true" />
          <strong aria-hidden="true">6</strong>
          <small aria-hidden="true">escolhas</small>
        </div>
        <div className="quiz-start__content">
          <p className="quiz-eyebrow">Um editorial interativo</p>
          <h1 ref={titleRef} tabIndex={-1}>
            <span>Onde o seu cuidado</span>
            <em>encontra ritmo?</em>
          </h1>
          <p className="quiz-lead">
            Seis cenas rápidas para perceber o que ajuda uma rotina a caber
            na vida real — inclusive quando o dia sai do plano.
          </p>
          <button
            className="quiz-button quiz-button--primary"
            type="button"
            onClick={onStart}
          >
            Entrar na experiência
          </button>
          <p className="quiz-microcopy">
            Menos de 2 minutos. Você pode voltar e mudar respostas.
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
  const errorId = "quiz-error-" + question.id;
  const selectedOption = question.options.find(
    (option) => option.id === selectedOptionId,
  );

  function selectOption(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.currentTarget.value);
  }

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div
        className="quiz-shell quiz-question"
        data-direction={direction}
        data-presentation={question.presentation}
      >
        <div className="quiz-question__topline">
          <button className="quiz-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span>
            Voltar
          </button>
          <p>
            {String(step + 1).padStart(2, "0")} / {String(quizQuestions.length).padStart(2, "0")}
          </p>
        </div>

        <div
          className="quiz-progress"
          role="progressbar"
          aria-label="Progresso do quiz"
          aria-valuemin={1}
          aria-valuemax={quizQuestions.length}
          aria-valuenow={step + 1}
          aria-valuetext={
            "Pergunta " + String(step + 1) + " de " + String(quizQuestions.length)
          }
        >
          {quizQuestions.map((item, index) => (
            <span
              key={item.id}
              data-complete={index <= step}
              aria-hidden="true"
            />
          ))}
        </div>

        <section className="quiz-step" aria-labelledby="quiz-question-title">
          <div className="quiz-step__heading">
            <p className="quiz-eyebrow">{question.eyebrow}</p>
            <h1 id="quiz-question-title" ref={titleRef} tabIndex={-1}>
              {question.title}
            </h1>
            <p>{question.hint}</p>
          </div>

          <fieldset
            className="quiz-options"
            aria-describedby={errorVisible ? errorId : undefined}
            aria-invalid={errorVisible}
          >
            <legend className="sr-only">Escolha uma resposta</legend>
            {question.options.map((option) => (
              <label
                className="quiz-option"
                data-selected={selectedOptionId === option.id}
                key={option.id}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={selectOption}
                />
                <span className="quiz-option__marker" aria-hidden="true" />
                <span className="quiz-option__copy">
                  <strong>{option.label}</strong>
                  {option.detail === undefined ? null : (
                    <small>{option.detail}</small>
                  )}
                </span>
              </label>
            ))}
          </fieldset>

          <p className="quiz-feedback" aria-live="polite">
            {selectedOptionId === null
              ? "Escolha a frase mais próxima do seu cotidiano."
              : selectedOption?.detail ??
                "Escolha registrada. Você pode continuar ou mudar a resposta."}
          </p>
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
              ? "Ver meu ritmo"
              : "Continuar"}
          </button>
        </section>
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
  const product = campaignAssets.productFrontPrimary;
  const canShowProduct = canRenderCampaignAsset(product);
  const evidence = proofAssets.find((asset) => asset.category === "cellulite");
  const recommendation = resolveQuizRecommendation(profileId);

  return (
    <main className="quiz-main quiz-main--result" id="conteudo-quiz">
      <div className="quiz-result">
        <div className="quiz-result__reveal">
          <div className="quiz-result__reveal-band" aria-hidden="true" />
          <div className="quiz-shell">
            <p className="quiz-eyebrow">{profile.eyebrow}</p>
            <h1 ref={titleRef} tabIndex={-1}>
              {profile.title}
            </h1>
            <p>{profile.description}</p>
            <span>perfil de rotina · não diagnóstico</span>
          </div>
        </div>

        <div className="quiz-shell quiz-result__body">
          <section className="quiz-result__traits" aria-labelledby="traits-title">
            <p className="quiz-eyebrow">Três pistas</p>
            <h2 id="traits-title">O que aparece no seu jeito de cuidar.</h2>
            <ul>
              {profile.characteristics.map((characteristic, index) => (
                <li key={characteristic}><span>0{index + 1}</span>{characteristic}</li>
              ))}
            </ul>
          </section>

          <section className="quiz-result__ritual" aria-labelledby="ritual-title">
            <p className="quiz-eyebrow">Para levar para a vida real</p>
            <h2 id="ritual-title">{profile.ritualTitle}</h2>
            <p>{profile.ritual}</p>
          </section>

          <section className="quiz-next-step" aria-labelledby="next-step-title">
            <div className="quiz-next-step__media" data-media-status={canShowProduct ? "preview" : "blocked"}>
              {canShowProduct ? (
                <img src={product.src} width={product.width} height={product.height} alt={product.alt} loading="lazy" decoding="async" />
              ) : <span aria-hidden="true">CeluClin</span>}
            </div>
            <div className="quiz-next-step__copy">
              <p className="quiz-eyebrow">Um próximo passo possível</p>
              <h2 id="next-step-title">Conhecer antes de escolher.</h2>
              <p>{profile.nextStep}</p>
              <div className="quiz-result__actions">
                <a className="quiz-button quiz-button--primary" href="/#composicao" onClick={() => recordQuizEvent("quiz_composition_click", { source: "quiz" })}>
                  Abrir a composição
                </a>
                <a className="quiz-text-link" href="/#rotulo">Ler o rótulo original</a>
              </div>
            </div>
          </section>

          {recommendation !== null ? (
            <section className="quiz-recommendation" aria-labelledby="recommendation-title" data-ready="true">
              <p className="quiz-eyebrow">{recommendation.disclosure}</p>
              <h2 id="recommendation-title">Opção sugerida para o seu ritmo</h2>
              <p>{recommendation.rationale}</p>
              <a className="quiz-button quiz-button--primary" href={recommendation.offer.checkoutUrl}>Ver opção de {recommendation.offer.approximateDurationMonths * 30} dias</a>
            </section>
          ) : internalMediaPreview ? (
            <section className="quiz-recommendation" aria-labelledby="recommendation-title" data-ready="false">
              <p className="quiz-eyebrow">Próximo passo comercial</p>
              <h2 id="recommendation-title">Opção sugerida para o seu ritmo</h2>
              <p>A recomendação de conveniência permanece protegida até ofertas, política, mídia, identidade empresarial e situação sanitária estarem aprovadas.</p>
              <span>Recomendação não publicada</span>
            </section>
          ) : null}

          {evidence?.src === null || evidence === undefined ? null : (
            <section className="quiz-evidence" aria-labelledby="evidence-title">
              <div>
                <p className="quiz-eyebrow">Prova geral da marca</p>
                <h2 id="evidence-title">Uma imagem autorizada. Não um resultado calculado pelo quiz.</h2>
                <p>{proofAuthorization.disclaimer} Esta imagem não foi escolhida a partir das suas respostas.</p>
                <a className="quiz-text-link" href="/#resultados">Ver todas as séries</a>
              </div>
              <img src={evidence.src} width={evidence.width} height={evidence.height} alt={evidence.alt} loading="lazy" decoding="async" />
            </section>
          )}

          <div className="quiz-result__footer">
            <p>
              Este perfil descreve preferências de organização. Não é
              diagnóstico, avaliação corporal ou recomendação médica.
            </p>
            <button
              className="quiz-text-button"
              type="button"
              onClick={onRestart}
            >
              Refazer o quiz
            </button>
          </div>
          <QuizPrivacyNotice />
        </div>
      </div>
    </main>
  );
}

function QuizInvalidResult({ onStart }: { readonly onStart: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useTitleFocus(titleRef, "invalid");

  return (
    <main className="quiz-main" id="conteudo-quiz">
      <div className="quiz-shell quiz-state-message">
        <p className="quiz-eyebrow">Resultado incompleto</p>
        <h1 ref={titleRef} tabIndex={-1}>Seu ritmo precisa das seis escolhas.</h1>
        <p>
          Nenhum perfil é criado sem respostas válidas. Comece de novo para
          chegar a uma revelação que realmente use o conjunto.
        </p>
        <button className="quiz-button quiz-button--primary" onClick={onStart}>
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
      <div className="quiz-shell quiz-state-message">
        <p className="quiz-eyebrow">Experiência em revisão</p>
        <h1 ref={titleRef} tabIndex={-1}>O quiz ainda não está publicado.</h1>
        <p>
          Enquanto a revisão humana e os gates de produção não terminam, você
          pode consultar as informações confirmadas do CeluClin.
        </p>
        <a className="quiz-button quiz-button--primary" href="/#composicao">
          Abrir a composição
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
  return [
    ...answers.filter((answer) => answer.questionId !== questionId),
    { questionId, optionId },
  ];
}

export function QuizRoute() {
  const initialRoute = getQuizRoutePath(location.pathname) ?? "quiz";
  const [route, setRoute] = useState<QuizRoutePath>(initialRoute);
  const [quizState, setQuizState] = useState<QuizStoredState>(loadQuizState);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [errorVisible, setErrorVisible] = useState(false);
  const viewRecorded = useRef(false);
  const accessMode = getQuizAccessMode(
    quizPublicationStatus,
    import.meta.env.DEV,
    import.meta.env.VITE_INTERNAL_QUIZ === "true",
  );

  function navigate(nextRoute: QuizRoutePath, replace = false) {
    history[replace ? "replaceState" : "pushState"](
      null,
      "",
      getQuizUrl(nextRoute),
    );
    setRoute(nextRoute);
  }

  useEffect(() => {
    function handlePopState() {
      setRoute(getQuizRoutePath(location.pathname) ?? "quiz");
    }
    addEventListener("popstate", handlePopState);
    return () => removeEventListener("popstate", handlePopState);
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
    persistState({
      answers: quizState.answers,
      currentStep: quizQuestions.length,
      profile,
      completedAt: new Date().toISOString(),
    });
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
    <div
      className="quiz-route"
      data-publication-status={quizPublicationStatus}
      data-route={route}
    >
      <QuizMetadata path={route} />
      <a className="skip-link" href="#conteudo-quiz">Ir para o conteúdo</a>
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
