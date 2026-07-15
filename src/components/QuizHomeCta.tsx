import { quizPublicationApproved } from "../data/quizPublicationConfig";
import "../quiz/homeQuizCta.css";

export function QuizHomeCta() {
  const internalPreview =
    import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QUIZ === "true";
  if (!quizPublicationApproved && !internalPreview) return null;

  return (
    <section className="home-quiz-cta" aria-labelledby="home-quiz-title" data-internal-preview={internalPreview}>
      <div className="home-quiz-cta__track" aria-hidden="true">
        começo · retomada · constância · vida real
      </div>
      <div className="home-quiz-cta__layout section-shell">
        <div className="home-quiz-cta__mark" aria-hidden="true"><span>6</span><small>escolhas</small></div>
        <div>
          <p className="eyebrow eyebrow--light">Editorial interativo</p>
          <h2 id="home-quiz-title">Onde o seu cuidado <em>encontra ritmo?</em></h2>
        </div>
        <div className="home-quiz-cta__body">
          <p>Seis escolhas rápidas sobre começo, interrupção e retomada. O resultado descreve organização — nunca o seu corpo.</p>
          <a className="button button--light" href="/quiz">Descobrir meu ritmo</a>
          <small>Menos de 2 minutos · sem dados pessoais</small>
        </div>
      </div>
    </section>
  );
}
