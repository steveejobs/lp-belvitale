import { quizOfferOrder, quizOffers } from "../content/offers";
import type { QuizPlanId } from "../domain/quiz.types";

interface OfferComparisonProps {
  readonly selected: QuizPlanId;
  readonly recommended: QuizPlanId;
  readonly onSelect: (plan: QuizPlanId) => void;
}

export function OfferComparison({ selected, recommended, onSelect }: OfferComparisonProps) {
  return (
    <section className="quiz-offer-comparison" aria-labelledby="offer-comparison-title">
      <div className="quiz-offer-comparison__intro">
        <p className="quiz-kicker">Comparação transparente</p>
        <h2 id="offer-comparison-title">As três opções usam o mesmo produto e o mesmo modo de uso.</h2>
        <p>A diferença é quantidade de frascos, estoque aproximado e frequência de reposição — não eficácia.</p>
      </div>
      <div className="quiz-offer-comparison__grid">
        {quizOfferOrder.map((plan) => {
          const offer = quizOffers[plan];
          const isSelected = selected === plan;
          return (
            <button
              key={offer.id}
              type="button"
              className="quiz-comparison-card"
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => onSelect(plan)}
            >
              <span className="quiz-comparison-card__top">
                {recommended === plan ? <em>Sua recomendação</em> : <i>Outra opção</i>}
                <strong>{offer.title}</strong>
              </span>
              <span className="quiz-comparison-card__capsules" aria-hidden="true">
                {Array.from({ length: offer.bottles }, (_, index) => <i key={index} />)}
              </span>
              <span>{offer.durationLabel}</span>
              <small>{offer.bestFor}</small>
              {offer.additionalBottles > 0 ? <b>Oferta oficial: 5 + 2 frascos</b> : null}
              <u>{isSelected ? "Opção selecionada" : "Selecionar esta opção"}</u>
            </button>
          );
        })}
      </div>
    </section>
  );
}
