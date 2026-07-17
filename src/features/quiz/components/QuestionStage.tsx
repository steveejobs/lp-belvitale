import { useEffect, useRef } from "react";
import type { QuizQuestion } from "../domain/quiz.types";
import { getMotionFamilyAttribute } from "../motion/quiz.transitions";
import { ChoiceCard } from "./ChoiceCard";
import { ChoiceScale } from "./ChoiceScale";
import { ChoiceScenario } from "./ChoiceScenario";

interface QuestionStageProps {
  readonly question: QuizQuestion;
  readonly selectedId: string | undefined;
  readonly questionNumber: number;
  readonly onSelect: (optionId: string) => void;
}

export function QuestionStage({
  question,
  selectedId,
  questionNumber,
  onSelect,
}: QuestionStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [question.id]);

  const choices = question.presentation === "scale" ? (
    <ChoiceScale options={question.options} selectedId={selectedId} onSelect={onSelect} />
  ) : question.presentation === "scenario" ? (
    <ChoiceScenario options={question.options} selectedId={selectedId} onSelect={onSelect} />
  ) : (
    <div className="quiz-choices quiz-choices--cards">
      {question.options.map((option, index) => (
        <ChoiceCard
          key={option.id}
          option={option}
          index={index}
          selected={option.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );

  return (
    <main
      className="quiz-main quiz-main--question"
      id="conteudo-quiz"
      data-motion={getMotionFamilyAttribute("question")}
    >
      <div className="quiz-question-stage">
        <section className="quiz-question-stage__prompt">
          <p className="quiz-kicker">{question.eyebrow}</p>
          <span className="quiz-question-number" aria-hidden="true">{String(questionNumber).padStart(2, "0")}</span>
          <h1 ref={titleRef} tabIndex={-1}>{question.prompt}</h1>
          <p className="quiz-question-context">{question.context}</p>
          {question.commercial ? (
            <span className="quiz-commercial-marker">Esta resposta participa da recomendação comercial</span>
          ) : null}
        </section>
        <section className="quiz-question-stage__answers" aria-label={`Escolhas para: ${question.prompt}`}>
          {choices}
          <p className="quiz-selection-hint" aria-live="polite">
            {selectedId === undefined ? "Escolha uma cena para continuar" : "Escolha registrada. Avançando…"}
          </p>
        </section>
      </div>
    </main>
  );
}
