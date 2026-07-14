import { homeContent } from "../content/homeContent";

export function EducationSection() {
  const { education } = homeContent;

  return (
    <section className="education-section" aria-labelledby="education-title">
      <div className="section-shell education-section__layout">
        <p className="eyebrow">{education.eyebrow}</p>
        <h2 id="education-title">{education.title}</h2>
        <div className="education-section__note">
          <p>{education.body}</p>
          <small>{education.sourceLabel}</small>
        </div>
      </div>
    </section>
  );
}
