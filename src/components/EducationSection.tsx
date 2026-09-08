import { Reveal } from "./ui/Reveal";
export function EducationSection() {
  return (
    <section className="skin-context" aria-labelledby="education-title">
      <Reveal className="section-shell skin-context__layout" effect="slide-left">
        <div><p className="eyebrow eyebrow--light">Entender também é cuidar</p><h2 id="education-title">A aparência da pele<br /><em>não conta a história toda.</em></h2></div>
        <div><p>A celulite é comum em corpos diferentes. Mudanças de peso também podem modificar como a pele aparece sobre o contorno do corpo. Isso ajuda a explicar por que mulheres chegam ao mesmo incômodo por caminhos diferentes.</p><p>Alimentação, movimento e cuidados individualizados fazem parte dessa conversa. Um suplemento tem seu próprio papel, com possibilidades e limites.</p><a className="home-source" href="https://www.aad.org/public/cosmetic/fat-removal/cellulite-treatments-what-really-works" target="_blank" rel="noreferrer">Referência: Academia Americana de Dermatologia ↗</a></div>
      </Reveal>
    </section>
  );
}
