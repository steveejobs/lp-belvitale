import { quizQuestions } from "../content/questions";
import type {
  QuizAnswerMap,
  QuizQuestionId,
  QuizRecommendation,
} from "../domain/quiz.types";

interface ResultReasoningProps {
  readonly answers: QuizAnswerMap;
  readonly recommendation: QuizRecommendation;
  readonly onReview: (questionId: QuizQuestionId) => void;
}

export function ResultReasoning({ answers, recommendation, onReview }: ResultReasoningProps) {
  return (
    <section className="quiz-result-reasoning" aria-labelledby="result-reasoning-title">
      <div>
        <p className="quiz-kicker">A lógica fica visível</p>
        <h2 id="result-reasoning-title">Perfil e oferta foram calculados em trilhas separadas.</h2>
        <p>
          As cinco primeiras respostas formaram a leitura de rotina. Somente planejamento,
          continuidade, reposição, compromisso e prontidão — declarados nas duas últimas cenas —
          participaram da duração comercial.
        </p>
      </div>
      <div className="quiz-result-reasoning__recommendation">
        <span>Por que esta opção será recomendada</span>
        <p>
          Recomendamos esta opção porque {recommendation.reasons[0]}, {recommendation.reasons[1]} e {recommendation.reasons[2]}.
        </p>
        {recommendation.conditional ? (
          <small>
            Como você indicou que não quer decidir uma compra agora, a opção será mostrada apenas como o menor compromisso caso você escolha avançar.
          </small>
        ) : null}
      </div>
      <details className="quiz-answer-review">
        <summary>Revisar minhas 7 respostas</summary>
        <ol>
          {quizQuestions.map((question) => {
            const answer = answers[question.id];
            const option = question.options.find((candidate) => candidate.id === answer);
            return (
              <li key={question.id}>
                <div>
                  <small>{question.eyebrow}</small>
                  <strong>{option?.label ?? "Resposta não encontrada"}</strong>
                </div>
                <button type="button" onClick={() => onReview(question.id)}>
                  Alterar <span className="quiz-visually-hidden">resposta de {question.prompt}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </details>
    </section>
  );
}
