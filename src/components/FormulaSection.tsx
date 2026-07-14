import {
  formulaPublicationState,
  getPublishableIngredients,
  ingredientFacts,
  type FormulaPublicationState,
  usageFact,
} from "../data/productFacts";

const partialMessage =
  "Algumas informações estão em processo de validação documental. Consulte o rótulo original disponível nesta página.";

const blockedMessage =
  "A composição completa será publicada após validação documental. O rótulo original permanece disponível para consulta.";

function getDevelopmentPreviewState(): FormulaPublicationState | null {
  if (!import.meta.env.DEV) return null;
  const requestedState = new URLSearchParams(window.location.search).get(
    "formula-state",
  );
  return requestedState === "confirmed" || requestedState === "blocked"
    ? requestedState
    : null;
}

function focusLabelTitle() {
  window.requestAnimationFrame(() => {
    const labelTitle = document.getElementById("label-section-title");
    if (labelTitle === null) return;
    labelTitle.setAttribute("tabindex", "-1");
    labelTitle.focus({ preventScroll: true });
  });
}

export function FormulaSection() {
  const publicationState =
    getDevelopmentPreviewState() ?? formulaPublicationState;
  const publishableIngredients =
    publicationState === "blocked"
      ? []
      : getPublishableIngredients(ingredientFacts);

  return (
    <section
      className="product-detail formula-section"
      id="composicao"
      data-publication-state={publicationState}
      aria-labelledby="formula-title"
    >
      <div className="section-shell product-detail__layout">
        <div className="product-detail__heading">
          <p className="institutional-eyebrow">Composição</p>
          <h2 id="formula-title">
            Informação clara antes de qualquer escolha.
          </h2>
          <p>
            A composição deve ser consultada exatamente como aparece na
            embalagem. Por isso, exibimos somente dados confirmados e mantemos o
            rótulo original disponível para leitura.
          </p>
        </div>

        <div className="formula-section__content">
          {publicationState === "blocked" ? (
            <p className="formula-validation-note">{blockedMessage}</p>
          ) : (
            <>
              {usageFact.status === "confirmed" &&
              usageFact.capsulesPerServing !== undefined ? (
                <div className="formula-portion" aria-label="Porção confirmada">
                  <span>Quantidade por porção</span>
                  <strong>{usageFact.capsulesPerServing} cápsulas</strong>
                </div>
              ) : null}
              <dl className="formula-list">
                {publishableIngredients.map((ingredient) => (
                  <div className="formula-list__row" key={ingredient.id}>
                    <dt>{ingredient.name}</dt>
                    <dd>
                      <span>{ingredient.amount}</span>
                      {ingredient.dailyValue === undefined ? null : (
                        <small>{ingredient.dailyValue} VD</small>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {publicationState === "partial" ? (
                <p className="formula-validation-note">{partialMessage}</p>
              ) : null}
            </>
          )}

          <a
            className="label-anchor-link"
            href="#rotulo"
            onClick={focusLabelTitle}
          >
            Consultar rótulo original
          </a>
        </div>
      </div>
    </section>
  );
}
