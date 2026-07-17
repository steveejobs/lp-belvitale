import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { sanitizeFirstName } from "../domain/quiz.validation";

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

  return (
    <section className="q6-name" aria-labelledby="q6-name-title">
      <p className="q6-eyebrow"><span /> Antes da primeira cena</p>
      <h1 id="q6-name-title" ref={titleRef} tabIndex={-1}>Como posso te chamar?</h1>
      <p>É opcional. Usaremos apenas em quatro momentos desta experiência e nunca enviaremos o nome cru para analytics.</p>
      <form onSubmit={submit}>
        <label htmlFor="q6-first-name">Primeiro nome</label>
        <input
          id="q6-first-name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value.slice(0, 24))}
          inputMode="text"
          autoComplete="given-name"
          maxLength={24}
          placeholder="Ex.: Marina"
        />
        <button className="q6-primary" type="submit">Continuar</button>
        <button className="q6-secondary" type="button" onClick={() => onContinue("", false)}>Continuar sem informar</button>
      </form>
    </section>
  );
}
