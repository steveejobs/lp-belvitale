import type { QuizRecommendation } from "../domain/quiz.types";

export function ResultReasoning({ recommendation }: { readonly recommendation: QuizRecommendation }) {
  return (
    <section className="q6-result-reasoning" aria-labelledby="q6-reasoning-title">
      <p className="q6-eyebrow"><span /> Por que esta opção apareceu</p>
      <h2 id="q6-reasoning-title">A recomendação segue o compromisso que você declarou.</h2>
      <ol>
        {recommendation.reasons.map((reason, index) => (
          <li key={reason}><span>{String(index + 1).padStart(2, "0")}</span><p>{reason}</p></li>
        ))}
      </ol>
      <small>Preocupação visual, roupa, foto e aparência não alteram quantidade ou duração.</small>
    </section>
  );
}
