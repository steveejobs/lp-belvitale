import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QuizRoute } from "./components/QuizRoute";
import "./quiz-base.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Elemento raiz do quiz nao encontrado.");
}

createRoot(root).render(
  <StrictMode>
    <QuizRoute />
  </StrictMode>,
);

