import { quizPublicationApproved } from "../data/quizPublicationConfig";
import "../quiz/homeQuizCta.css";

export function QuizHomeCta() {
  if (!quizPublicationApproved) return null;

  return (
    <section className="home-quiz-cta" aria-labelledby="home-quiz-title">
      <div className="section-shell home-quiz-cta__layout">
        <div>
          <p className="institutional-eyebrow">Quiz de rotina</p>
          <h2 id="home-quiz-title">
            Entenda qual tipo de rotina combina com seu momento
          </h2>
          <p>
            Responda seis perguntas rápidas sobre seus hábitos e preferências.
            Sem diagnóstico e sem coleta de dados pessoais.
          </p>
        </div>
        <a className="home-quiz-cta__link" href="/quiz">
          Fazer o quiz
        </a>
      </div>
    </section>
  );
}
