import type { QuizOption } from "../domain/quiz.types";
import { ChoiceCard } from "./ChoiceCard";

export function ChoiceMedia(props: {
  readonly option: QuizOption;
  readonly selected: boolean;
  readonly subdued: boolean;
  readonly onSelect: () => void;
}) {
  return <ChoiceCard {...props} presentation="media" />;
}
