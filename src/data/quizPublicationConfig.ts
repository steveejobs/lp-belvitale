import {
  resolveQuizPublicationStatus,
  type QuizPublicationStatus,
} from "./quizPublication";
import { regulatoryPublicationReady } from "./regulatoryFacts";

export const quizPublicationApproved =
  import.meta.env.VITE_QUIZ_PUBLICATION_STATUS === "approved" &&
  regulatoryPublicationReady;

export const quizPublicationStatus: QuizPublicationStatus =
  regulatoryPublicationReady
    ? resolveQuizPublicationStatus(
        import.meta.env.VITE_QUIZ_PUBLICATION_STATUS,
        import.meta.env.DEV,
      )
    : import.meta.env.DEV
      ? "development"
      : "blocked";
