import { recordHomeEvent } from "../analytics/homeEvents";
import { Reveal } from "./ui/Reveal";
import { quizEntryHref } from "../analytics/funnelAttribution";

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
            Se a celulite já acompanha você há algum tempo, comece pela sua rotina.
            Se a mudança apareceu depois de emagrecer, existe uma conversa específica para esse momento.
          </p>
          <div className="quiz-bridge__actions">
            <a
              className="button button--light"
              href={quizEntryHref("/quiz")}
              onClick={() => recordHomeEvent("quiz_cta_click", { location: "bridge" })}
            >
              Celulite no meu dia a dia
            </a>
            <a
              className="button button--dark-outline"
              href={quizEntryHref("/quiz-monj")}
              onClick={() => recordHomeEvent("quiz_cta_click", { location: "bridge-post-loss", destination: "/quiz-monj" })}
            >
              Meu corpo depois de emagrecer
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
