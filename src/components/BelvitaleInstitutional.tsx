import { homeContent } from "../content/homeContent";

export function BelvitaleInstitutional() {
  const { closing } = homeContent;

  return (
    <section
      className="closing-statement"
      id="belvitale"
      aria-labelledby="closing-title"
    >
      <div className="closing-statement__band" aria-hidden="true" />
      <div className="section-shell closing-statement__layout">
        <p className="eyebrow eyebrow--light">{closing.eyebrow}</p>
        <h2 id="closing-title">
          <span>{closing.titleLead}</span>
          <em>{closing.titleAccent}</em>
        </h2>
        <p>{closing.body}</p>
        <a className="text-link text-link--light" href="#inicio">
          Voltar ao começo
          <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  );
}
