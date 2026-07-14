import {
  resolveQuizPublicationStatus,
  type QuizPublicationStatus,
} from "./quizPublication";

export const quizPublicationApproved =
  import.meta.env.VITE_QUIZ_PUBLICATION_STATUS === "approved";

export const quizPublicationStatus: QuizPublicationStatus =
  resolveQuizPublicationStatus(
    import.meta.env.VITE_QUIZ_PUBLICATION_STATUS,
    import.meta.env.DEV,
  );
