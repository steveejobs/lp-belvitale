import { useEffect, useRef } from "react";

interface InsightStageProps {
  readonly sequence: 1 | 2;
  readonly name: string;
  readonly insight: string;
  readonly explanation: string;
  readonly onContinue: () => void;
}

export function InsightStage({ sequence, name, insight, explanation, onContinue }: InsightStageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, [sequence]);
  const greeting = name.length > 0 ? name + ", já apareceu um padrão." : "Já apareceu um padrão.";
  return (
    <section className="q6-insight" data-sequence={sequence} aria-labelledby={"q6-insight-" + String(sequence)}>
      <div className="q6-insight__meter" aria-hidden="true">
        <span /><span /><span data-unlocked /><span data-unlocked={sequence === 2} />
      </div>
      <p className="q6-eyebrow"><span /> Microinsight {sequence} de 2</p>
      <h1 id={"q6-insight-" + String(sequence)} ref={titleRef} tabIndex={-1}>{greeting}</h1>
      <blockquote>{insight}</blockquote>
      <p>{explanation}</p>
      <button className="q6-primary" type="button" onClick={onContinue}>Continuar <span aria-hidden="true">→</span></button>
    </section>
  );
}
