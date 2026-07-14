import { homeContent } from "../content/homeContent";

export function FreedomEditorial() {
  const { emotional } = homeContent;

  return (
    <section
      className="freedom-editorial"
      id="liberdade"
      aria-labelledby="freedom-title"
    >
      <div className="freedom-editorial__stripe" aria-hidden="true">
        por vontade
      </div>
      <div className="section-shell freedom-editorial__layout">
        <p className="eyebrow eyebrow--light">{emotional.eyebrow}</p>
        <h2 id="freedom-title">{emotional.title}</h2>
        <div className="freedom-editorial__story">
          <p>{emotional.passages[0]}</p>
          <p>{emotional.passages[1]}</p>
        </div>
        <p className="freedom-editorial__release">{emotional.release}</p>
      </div>
    </section>
  );
}
