import { homeContent } from "../content/homeContent";
import {
  professionalGuidance,
  usageFact,
  warningFacts,
} from "../data/productFacts";

export function RoutineSection() {
  const warnings = warningFacts.filter(
    (warning) => warning.status === "confirmed",
  );
  const { routine } = homeContent;
  const hasExactDuration =
    usageFact.durationDays !== null &&
    usageFact.durationDays !== undefined &&
    usageFact.totalCapsules !== undefined &&
    usageFact.capsulesPerDay !== undefined;

  return (
    <section
      className="routine-section"
      id="rotina"
      aria-labelledby="routine-title"
    >
      <div className="section-shell routine-section__layout">
        <div className="routine-section__heading">
          <p className="eyebrow">{routine.eyebrow}</p>
          <h2 id="routine-title">
            <span>{routine.titleLead}</span>
            <em>{routine.titleAccent}</em>
          </h2>
          <p>{routine.body}</p>
        </div>

        {hasExactDuration ? (
          <div className="routine-equation" aria-label="Cálculo da duração">
            <div>
              <strong>{usageFact.totalCapsules}</strong>
              <span>no frasco</span>
            </div>
            <span aria-hidden="true">÷</span>
            <div>
              <strong>{usageFact.capsulesPerDay}</strong>
              <span>por dia</span>
            </div>
            <span aria-hidden="true">=</span>
            <div>
              <strong>{usageFact.durationDays}</strong>
              <span>dias</span>
            </div>
          </div>
        ) : null}

        <aside className="routine-guidance" aria-labelledby="guidance-title">
          <h3 id="guidance-title">Antes de incluir na rotina</h3>
          <div>
            <p>{usageFact.audience}.</p>
            {warnings.map((warning) => (
              <p key={warning.id}>{warning.text}</p>
            ))}
            <p>{professionalGuidance}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
