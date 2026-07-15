import { homeContent } from "../content/homeContent";

export function EducationSection() {
  const { education } = homeContent;

  return (
    <section className="skin-context" aria-labelledby="education-title">
      <div className="skin-context__ticker" aria-hidden="true">
        {education.counters.map((item) => (
          <span key={item}>{item} ≠ celulite</span>
        ))}
      </div>
      <div className="skin-context__layout section-shell">
        <p className="eyebrow">{education.eyebrow}</p>
        <h2 id="education-title">{education.title}</h2>
        <div>
          <p>{education.body}</p>
          <small>{education.sourceLabel}</small>
        </div>
      </div>
    </section>
  );
}
