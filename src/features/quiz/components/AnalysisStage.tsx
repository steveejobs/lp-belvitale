import { useEffect, useRef, useState } from "react";

const analysisSteps = [
  "Conectando o que você percebe ao que isso faz você sentir",
  "Identificando o padrão que interrompe a sua continuidade",
  "Organizando uma leitura que respeita a sua vida real",
] as const;

export function AnalysisStage() {
  const [completed, setCompleted] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const timers = analysisSteps.map((_, index) => window.setTimeout(() => setCompleted(index + 1), 420 + index * 520));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className="q7-analysis" aria-labelledby="q7-analysis-title" role="status">
      <div className="q7-analysis__orb" aria-hidden="true"><span /><i /></div>
      <div className="q7-analysis__copy">
        <p className="q7-step-label">Sua leitura está tomando forma</p>
        <h1 id="q7-analysis-title" ref={titleRef} tabIndex={-1}>Organizando o que você acabou de contar.</h1>
        <p>Sem diagnóstico e sem respostas genéricas: apenas conectando as suas escolhas para devolver um retrato coerente.</p>
        <ol>
          {analysisSteps.map((step, index) => (
            <li key={step} data-complete={index < completed} data-active={index === completed}>
              <span aria-hidden="true">{index < completed ? "✓" : String(index + 1).padStart(2, "0")}</span>{step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
