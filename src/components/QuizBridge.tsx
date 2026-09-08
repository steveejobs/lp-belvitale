import { recordHomeEvent } from "../analytics/homeEvents";
import { Reveal } from "./ui/Reveal";

export function QuizBridge() {
  return (
    <section className="quiz-bridge" id="descobrir" aria-labelledby="quiz-bridge-title">
      <Reveal className="section-shell quiz-bridge__layout" effect="slide-right" stagger>
        <div>
          <p className="eyebrow eyebrow--light">Ainda não sabe por onde começar?</p>
          <h2 id="quiz-bridge-title">
            Descubra um ponto de partida que faça sentido para você.
          </h2>
        </div>
        <div className="quiz-bridge__copy">
          <p>
            O quiz é uma experiência de descoberta: algumas perguntas para organizar o seu
            momento antes de conhecer as opções do CeluClin.
          </p>
          <div className="quiz-bridge__actions">
            <a
              className="button button--light"
              href="/quiz"
              onClick={() => recordHomeEvent("quiz_cta_click", { location: "bridge" })}
            >
              Fazer o quiz
            </a>
            <a
              className="button button--dark-outline"
              href="#resultados"
              onClick={() => recordHomeEvent("proof_interaction", { location: "quiz-bridge" })}
            >
              Ver a prova autorizada
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
