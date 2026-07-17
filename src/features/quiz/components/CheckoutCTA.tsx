import type { QuizOfferContent } from "../domain/quiz.types";

interface CheckoutCTAProps {
  readonly offer: QuizOfferContent;
  readonly onClick: () => void;
}

export function CheckoutCTA({ offer, onClick }: CheckoutCTAProps) {
  return (
    <div className="quiz-checkout-cta">
      <a href={offer.checkoutUrl} onClick={onClick}>
        Ir ao checkout oficial — {offer.durationLabel} <span aria-hidden="true">↗</span>
      </a>
      <p>Você sairá para o checkout oficial da Belvitale. Nenhuma compra acontece neste clique.</p>
    </div>
  );
}
