import type { CSSProperties } from "react";
import { useQuizScrollReveal } from "../motion/useQuizScrollReveal";

const moments = [
  {
    src: "/lifestyle/freedom-01-768.webp",
    width: 768,
    height: 960,
    croppedRatio: "4 / 5",
    alt: "Cena ilustrativa de uma mulher de camisa clara junto à janela",
  },
  {
    src: "/lifestyle/routine-01.webp",
    width: 1122,
    height: 1402,
    croppedRatio: "4 / 5",
    alt: "Cena ilustrativa de mãos servindo água em um copo, em casa",
  },
] as const;

export function DesireMosaic({ scene }: { readonly scene?: string | undefined }) {
  const { ref: revealRef, visible } = useQuizScrollReveal<HTMLElement>();

  return (
    <section
      ref={revealRef}
      className="q7-desire q7-scroll-reveal"
      data-visible={visible}
      aria-labelledby="q7-desire-title"
    >
      <header>
        <p className="q7-step-label">O que você quer viver com mais leveza</p>
        <h2 id="q7-desire-title">{scene === "easy-photos" ? "Estar na foto. E gostar de guardar esse momento." : scene === "calm-beach" ? "Escolher o biquíni. E aproveitar o dia." : scene === "saved-clothes" ? "Tirar aquela roupa do armário. Porque deu vontade." : "Se cuidar e seguir com a vida. Sem esperar um corpo perfeito."}</h2>
        <p>Esse desejo importa. O cuidado que você escolher precisa respeitar suas expectativas, seu tempo e o que cabe no seu dia.</p>
      </header>
      <div className="q7-desire__mosaic" aria-label="Cenas ilustrativas de confiança e autocuidado">
        {moments.map((moment, index) => (
          <figure key={moment.src} style={{ "--q7-desire-order": index } as CSSProperties}>
            <span style={{ aspectRatio: moment.croppedRatio }}>
              <img src={moment.src} width={moment.width} height={moment.height} alt={moment.alt} loading="lazy" decoding="async" />
            </span>
          </figure>
        ))}
      </div>
      <p className="q7-desire__note">Cenas ilustrativas. O objetivo é representar o desejo de confiança, não um resultado garantido.</p>
    </section>
  );
}
