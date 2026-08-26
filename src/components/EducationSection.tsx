import { homeContent } from "../content/homeContent";
import { Reveal } from "./ui/Reveal";

export function EducationSection() {
  const { education } = homeContent;

  return (
    <section className="skin-context" aria-labelledby="education-title">
      <Reveal className="skin-context__layout section-shell" effect="slide-right" stagger>
        <p className="eyebrow">{education.eyebrow}</p>
        <h2 id="education-title">{education.title}</h2>
        <div>
          <p>{education.body}</p>
          <small>{education.sourceLabel}</small>
        </div>
      </Reveal>
    </section>
  );
}
