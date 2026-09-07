import type { CSSProperties } from "react";
import { useQuizScrollReveal } from "../motion/useQuizScrollReveal";

const moments = [
  {
    src: "/lifestyle/quiz-desire-01.webp",
    width: 992,
    height: 1056,
    croppedRatio: "992 / 976",
    alt: "Cena editorial de uma mulher em um momento de autocuidado",
  },
  {
    src: "/lifestyle/quiz-desire-02.webp",
    width: 960,
    height: 1088,
    croppedRatio: "960 / 1000",
    alt: "Cena editorial sobre confiança corporal e autocuidado",
  },
  {
    src: "/lifestyle/quiz-desire-03.webp",
    width: 992,
    height: 1056,
    croppedRatio: "992 / 976",
    alt: "Mulher durante um ritual cotidiano de cuidado pessoal",
  },
] as const;

export function DesireMosaic() {
  const { ref: revealRef, visible } = useQuizScrollReveal<HTMLElement>();

  return (
    <section
      ref={revealRef}
      className="q7-desire q7-scroll-reveal"
      data-visible={visible}
      aria-labelledby="q7-desire-title"
    >
      <header>
        <p className="q7-step-label">O que existe por trás desse incômodo</p>
        <h2 id="q7-desire-title">Talvez você não queira outro corpo. Talvez queira voltar a viver bem no seu.</h2>
        <p>Vestir uma peça sem trocar três vezes. Sair em uma foto sem procurar defeito. Sentir que o cuidado voltou a caber na sua vida.</p>
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
