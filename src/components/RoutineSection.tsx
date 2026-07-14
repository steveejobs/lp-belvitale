import {
  professionalGuidance,
  usageFact,
  warningFacts,
} from "../data/productFacts";

export function RoutineSection() {
  const confirmedWarnings = warningFacts.filter(
    (warning) => warning.status === "confirmed",
  );
  const hasExactDuration =
    usageFact.durationDays !== null &&
    usageFact.durationDays !== undefined &&
    usageFact.totalCapsules !== undefined &&
    usageFact.capsulesPerDay !== undefined;

  return (
    <section
      className="product-detail routine-section"
      id="rotina"
      aria-labelledby="routine-title"
    >
      <div className="section-shell product-detail__layout">
        <div className="product-detail__heading">
          <p className="institutional-eyebrow">Rotina de uso</p>
          <h2 id="routine-title">
            Uma orientação simples, exatamente como informada na embalagem.
          </h2>
          <p>
            A sugestão de uso confirmada é apresentada sem acrescentar horários,
            combinações ou recomendações que não constam nas fontes auditadas.
          </p>
        </div>

        <div className="routine-section__content">
          <dl className="usage-list">
            <div className="usage-list__row">
              <dt>Sugestão de uso</dt>
              <dd>{usageFact.suggestedUse}</dd>
            </div>
            <div className="usage-list__row">
              <dt>Conteúdo do frasco</dt>
              <dd>{usageFact.totalCapsules} cápsulas</dd>
            </div>
            {hasExactDuration ? (
              <div className="usage-list__row">
                <dt>Duração calculada</dt>
                <dd>{usageFact.durationDays} dias</dd>
              </div>
            ) : null}
            <div className="usage-list__row">
              <dt>Público informado</dt>
              <dd>{usageFact.audience}</dd>
            </div>
          </dl>

          {hasExactDuration ? (
            <p className="duration-explanation">
              A duração de {usageFact.durationDays} dias resulta do cálculo
              exato de {usageFact.totalCapsules} cápsulas dividido por{" "}
              {usageFact.capsulesPerDay} cápsulas ao dia.
            </p>
          ) : null}

          <aside
            className="institutional-guidance"
            aria-labelledby="guidance-title"
          >
            <h3 id="guidance-title">Antes de incluir na rotina</h3>
            {confirmedWarnings.map((warning) => (
              <p key={warning.id}>{warning.text}</p>
            ))}
            <p>{professionalGuidance}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
