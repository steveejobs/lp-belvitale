import { QuizExperience } from "../features/quiz/components/QuizExperience";
import { quizPublicationStatus } from "../data/quizPublicationConfig";

function QuizUnavailable() {
  return (
    <main className="q7-unavailable" aria-labelledby="quiz-unavailable-title">
      <a href="/" aria-label="Voltar para a página inicial da Belvitale">Belvitale</a>
      <div>
        <p>Experiência Belvitale</p>
        <h1 id="quiz-unavailable-title">Essa experiência não está disponível agora.</h1>
        <p>Estamos revisando as informações necessárias para que cada etapa seja apresentada com responsabilidade e transparência.</p>
        <a href="/">Voltar para o início</a>
      </div>
    </main>
  );
}

export function QuizRoute() {
  return quizPublicationStatus === "blocked" ? <QuizUnavailable /> : <QuizExperience />;
}
