import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Elemento raiz da aplicação não encontrado.");
}

const appRoot = root;
appRoot.replaceChildren();

const conceptMatch = /^\/__concept\/([abc])\/?$/.exec(window.location.pathname);

async function startApplication(): Promise<void> {
  if (import.meta.env.DEV && conceptMatch !== null) {
    const concept = conceptMatch[1];
    if (concept !== "a" && concept !== "b" && concept !== "c") {
      throw new Error("Conceito visual inválido.");
    }

    await import("./concepts/concepts.css");
    const { ConceptLab } = await import("./concepts/ConceptLab");

    createRoot(appRoot).render(
      <StrictMode>
        <ConceptLab concept={concept} />
      </StrictMode>,
    );
    return;
  }

  const { App } = await import("./App");

  createRoot(appRoot).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void startApplication();
