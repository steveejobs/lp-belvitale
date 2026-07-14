import { quizPublicationApproved } from "../data/quizPublicationConfig";
import "../quiz/homeQuizCta.css";

export function QuizHomeCta() {
  const internalPreview = import.meta.env.VITE_INTERNAL_QUIZ === "true";
  if (!import.meta.env.DEV && !quizPublicationApproved && !internalPreview) {
    return null;
  }

  return (
    <section
      className="home-quiz-cta"
      aria-labelledby="home-quiz-title"
      data-internal-preview={internalPreview}
    >
      <div className="home-quiz-cta__band" aria-hidden="true">
        seis escolhas · um ritmo
      </div>
      <div className="section-shell home-quiz-cta__layout">
        <div>
          <p className="eyebrow eyebrow--light">Editorial interativo</p>
          <h2 id="home-quiz-title">
            Que ritmo faz
            <em>o cuidado continuar?</em>
          </h2>
        </div>
        <div className="home-quiz-cta__body">
          <p>
            Seis escolhas rápidas sobre começo, retomada e vida real. O
            resultado é um perfil de organização — nunca um diagnóstico.
          </p>
          <a className="button button--light" href="/quiz">
            Descobrir meu ritmo
          </a>
          <small>Menos de 2 minutos · sem dados pessoais</small>
        </div>
      </div>
    </section>
  );
}
