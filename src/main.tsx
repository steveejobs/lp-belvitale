import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Elemento raiz da aplicação não encontrado.");
}

const appRoot = root;

async function startApplication(): Promise<void> {
  const { App } = await import("./App");

  createRoot(appRoot).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void startApplication();
