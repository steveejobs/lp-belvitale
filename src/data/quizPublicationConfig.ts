import {
  resolveQuizPublicationStatus,
  type QuizPublicationStatus,
} from "./quizPublication";
import { regulatoryPublicationReady } from "./regulatoryFacts";

const quizEnvironment = import.meta.env as ImportMetaEnv | undefined;

export const quizPublicationApproved =
  quizEnvironment?.VITE_QUIZ_PUBLICATION_STATUS === "approved" &&
  regulatoryPublicationReady;

export const quizPreviewEnabled =
  quizEnvironment?.DEV === true ||
  quizEnvironment?.VITE_QUIZ_PREVIEW === "enabled";

export const quizPublicationStatus: QuizPublicationStatus =
  regulatoryPublicationReady
    ? resolveQuizPublicationStatus(
        quizEnvironment?.VITE_QUIZ_PUBLICATION_STATUS,
        quizEnvironment?.DEV === true,
      )
    : quizPreviewEnabled
      ? "development"
      : "blocked";
