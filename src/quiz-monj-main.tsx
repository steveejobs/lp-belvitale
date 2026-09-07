import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QuizMonjExperience } from "./features/quiz-monj/QuizMonjExperience";
import "./quiz-base.css";

const root = document.getElementById("root");

if (root === null) throw new Error("Elemento raiz do quiz Mounjaro não encontrado.");

createRoot(root).render(
  <StrictMode>
    <QuizMonjExperience />
  </StrictMode>,
);
