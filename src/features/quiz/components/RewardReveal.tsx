import type { NarrativeProfileId } from "../domain/quiz.types";

const content: Readonly<Record<NarrativeProfileId, readonly [string, string, string]>> = {
  "clear-first": ["Escolha um único critério verificável.", "Defina o primeiro gesto em uma frase.", "Revise apenas no sétimo dia."],
  "return-ready": ["Escolha uma âncora principal.", "Defina uma alternativa para dias cheios.", "Se pausar, volte sem compensar."],
  "proof-led": ["Leia composição e modo de uso.", "Confira limites de cada evidência.", "Compare opções pelo mesmo critério."],
  "continuity-minded": ["Prepare o ponto da rotina.", "Deixe o próximo passo visível.", "Marque uma data simples de revisão."],
};

export function RewardReveal({ profileId }: { readonly profileId: NarrativeProfileId }) {
  return (
    <section className="q6-reward-reveal" aria-labelledby="q6-reward-reveal-title">
      <div className="q6-reward-reveal__stamp" aria-hidden="true">7</div>
      <p className="q6-eyebrow"><span /> Roteiro desbloqueado</p>
      <h2 id="q6-reward-reveal-title">Três regras para os próximos sete dias.</h2>
      <ol>{content[profileId].map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
      <small>Este roteiro é uma sugestão de organização, não orientação de saúde.</small>
    </section>
  );
}
