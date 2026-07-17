import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { homeContent } from "../content/homeContent";
import {
  campaignAssets,
  canRenderCampaignAsset,
} from "../data/campaignAssets";
import {
  formulaPublicationState,
  getPublishableIngredients,
  ingredientFacts,
  type FormulaPublicationState,
  usageFact,
} from "../data/productFacts";
import { Reveal } from "./ui/Reveal";

function getDevelopmentPreviewState(): FormulaPublicationState | null {
  if (!import.meta.env.DEV) return null;
  const value = new URLSearchParams(window.location.search).get(
    "formula-state",
  );
  return value === "confirmed" || value === "blocked" ? value : null;
}

export function FormulaSection() {
  const publicationState =
    getDevelopmentPreviewState() ?? formulaPublicationState;
  const ingredients =
    publicationState === "blocked"
      ? []
      : getPublishableIngredients(ingredientFacts);
  const [activeId, setActiveId] = useState(
    () => ingredients[0]?.id ?? null,
  );
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active =
    ingredients.find((ingredient) => ingredient.id === activeId) ??
    ingredients[0];
  const { formula } = homeContent;
  const capsuleMedia = campaignAssets.capsules;
  const canShowCapsules = canRenderCampaignAsset(capsuleMedia);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offset =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (offset === 0 || ingredients.length === 0) return;
    event.preventDefault();
    const nextIndex =
      (index + offset + ingredients.length) % ingredients.length;
    const next = ingredients[nextIndex];
    if (next === undefined) return;
    setActiveId(next.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      className="formula-section"
      id="composicao"
      data-publication-state={publicationState}
      aria-labelledby="formula-title"
    >
      <Reveal className="section-shell formula-section__heading" effect="slide-left" stagger>
        <p className="eyebrow">{formula.eyebrow}</p>
        <h2 id="formula-title">{formula.title}</h2>
        <p>{formula.body}</p>
      </Reveal>

      <Reveal className="section-shell formula-section__experience" effect="clip" delay={70}>
        {active === undefined ? (
          <div className="formula-section__blocked" role="status">
            <p>
              Consulte a composição completa diretamente no rótulo original.
            </p>
            <a href="#rotulo">
              Consultar o rótulo original
            </a>
          </div>
        ) : (
          <>
            <figure className="formula-media" data-media-status={canShowCapsules ? "preview" : "blocked"}>
              {canShowCapsules ? (
                <img
                  src={capsuleMedia.src}
                  width={capsuleMedia.width}
                  height={capsuleMedia.height}
                  alt={capsuleMedia.alt}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span aria-hidden="true" />
              )}
              <figcaption>Cápsulas CeluClin</figcaption>
            </figure>
            <div
              className="formula-tabs"
              role="tablist"
              aria-label="Ingredientes confirmados"
              aria-orientation="vertical"
            >
              {ingredients.map((ingredient, index) => (
                <button
                  id={`formula-tab-${ingredient.id}`}
                  className="formula-tab"
                  key={ingredient.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active.id === ingredient.id}
                  aria-controls="formula-panel"
                  tabIndex={active.id === ingredient.id ? 0 : -1}
                  onClick={() => setActiveId(ingredient.id)}
                  onKeyDown={(event) => moveTab(event, index)}
                >
                  <span>{ingredient.name}</span>
                  <small>{ingredient.amount}</small>
                </button>
              ))}
            </div>

            <div
              className="formula-focus"
              id="formula-panel"
              role="tabpanel"
              aria-labelledby={`formula-tab-${active.id}`}
              tabIndex={0}
              key={active.id}
            >
              <span className="formula-focus__portion">
                Porção de {usageFact.capsulesPerServing} cápsulas
              </span>
              <p className="formula-focus__amount">{active.amount}</p>
              <h3>{active.name}</h3>
              <p className="formula-focus__source">{formula.source}</p>
              <span className="formula-focus__capsule" aria-hidden="true" />
            </div>
          </>
        )}
      </Reveal>

      <div className="section-shell formula-section__footer">
        {publicationState === "partial" ? (
          <p className="formula-validation-note">{formula.partial}</p>
        ) : null}
        {publicationState === "blocked" ? null : (
          <a className="text-link" href="#rotulo">
            Consultar o rótulo original
            <span aria-hidden="true">↘</span>
          </a>
        )}
      </div>
    </section>
  );
}
