import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { sanitizeFirstName } from "../domain/quiz.validation";
import { KineticText } from "./KineticText";

interface NameStageProps {
  readonly initialName: string;
  readonly onContinue: (name: string, provided: boolean) => void;
}

export function NameStage({ initialName, onContinue }: NameStageProps) {
  const [name, setName] = useState(initialName);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safe = sanitizeFirstName(name);
    onContinue(safe, safe.length > 0);
  };

  const title = "Como posso te chamar?";

  return (
    <section className="q7-name" aria-labelledby="q7-name-title">
      <p className="q7-step-label">Antes de começarmos</p>
      <h1 id="q7-name-title" ref={titleRef} tabIndex={-1} aria-label={title}><KineticText text={title} accentFrom={3} /></h1>
      <p>É opcional. Se você informar seu nome, a experiência fica mais personalizada.</p>
      <form onSubmit={submit}>
        <label htmlFor="q7-first-name">Seu primeiro nome</label>
        <input
          id="q7-first-name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value.slice(0, 24))}
          inputMode="text"
          autoComplete="given-name"
          maxLength={24}
          placeholder="Ex.: Marina"
          autoFocus
        />
        <button className="q7-primary" type="submit"><span>Continuar</span><i aria-hidden="true">→</i></button>
        <button className="q7-text-button" type="button" onClick={() => onContinue("", false)}>
          Prefiro continuar sem informar
        </button>
      </form>
    </section>
  );
}
